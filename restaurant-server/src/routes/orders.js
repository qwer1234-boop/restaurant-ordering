/**
 * 订单相关接口
 *   POST   /api/orders              提交订单（事务：写主表 + 明细 + 更新菜品销量库存）
 *   GET    /api/orders              订单列表，支持 ?status=待处理&limit=20
 *   GET    /api/orders/:orderNo     订单详情（含菜品明细）
 *   PUT    /api/orders/:orderNo     更新订单状态
 */
const express = require('express');
const { db } = require('../db');
const { ok, fail } = require('../utils/response');

const router = express.Router();

// 允许的订单状态（状态机约束，防止非法流转）
const ORDER_STATUS = ['待处理', '制作中', '已完成', '已取消'];

/** 生成订单号：D + 年月日时分秒 + 3位随机数，如 D20261001202225001 */
function buildOrderNo() {
  const d = new Date();
  const p = (n, len = 2) => String(n).padStart(len, '0');
  const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  const rand = p(Math.floor(Math.random() * 1000), 3);
  return `D${stamp}${rand}`;
}

/** 根据该桌是否还有进行中的订单，重算餐桌状态（0空闲 / 1使用中） */
function refreshTableStatus(tableNo) {
  const active = db.prepare(`
    SELECT COUNT(*) AS c FROM orders
     WHERE table_no = ? AND status IN ('待处理', '制作中')
  `).get(tableNo).c;

  db.prepare('UPDATE dining_table SET status = ? WHERE table_no = ?')
    .run(active > 0 ? 1 : 0, tableNo);
}

/** 查询订单详情（含明细），内部复用 */
function findOrderByNo(orderNo) {
  const order = db.prepare(`
    SELECT id, order_no AS orderNo, table_no AS tableNo, total_amount AS totalAmount,
           item_count AS itemCount, remark, status, created_at AS createdAt
      FROM orders
     WHERE order_no = ?
  `).get(orderNo);

  if (!order) return null;

  order.items = db.prepare(`
    SELECT id, dish_id AS dishId, dish_name AS name, emoji, price, count, subtotal
      FROM order_item
     WHERE order_id = ?
     ORDER BY id ASC
  `).all(order.id);

  return order;
}

// ------------------------------------------------------------
// 提交订单
// 请求体：{ tableNo: 'A01', remark: '不要辣', items: [{ dishId: 1, count: 2 }] }
// ------------------------------------------------------------
router.post('/orders', (req, res) => {
  const { tableNo, remark = '', items } = req.body || {};

  // —— 1. 参数校验 ——
  if (!tableNo) return fail(res, '缺少桌号 tableNo', 400);
  if (!Array.isArray(items) || items.length === 0) return fail(res, '购物车为空，无法下单', 400);

  const table = db.prepare('SELECT id, table_no FROM dining_table WHERE table_no = ?').get(String(tableNo));
  if (!table) return fail(res, `桌号 ${tableNo} 不存在`, 400);

  db.exec('BEGIN');  // 开启事务，保证订单主表/明细/菜品销量三者一致性
  try {
    const orderNo = buildOrderNo();
    let totalAmount = 0;
    let itemCount = 0;
    const detailRows = [];

    // —— 2. 逐条校验菜品并计算金额（价格一律以数据库为准，不信任前端传值）——
    for (const it of items) {
      const dishId = Number(it.dishId);
      const count = Number(it.count);

      if (!dishId || !Number.isInteger(count) || count <= 0) {
        throw new Error('菜品参数不合法');
      }

      const dish = db.prepare('SELECT id, name, price, emoji, stock, status FROM dish WHERE id = ?').get(dishId);
      if (!dish) throw new Error(`菜品 ID=${dishId} 不存在`);
      if (dish.status !== 1) throw new Error(`菜品「${dish.name}」已停售`);
      if (dish.stock < count) throw new Error(`菜品「${dish.name}」库存不足（剩余 ${dish.stock} 份）`);

      const subtotal = Number((dish.price * count).toFixed(2));
      totalAmount = Number((totalAmount + subtotal).toFixed(2));
      itemCount += count;
      detailRows.push({ dish, count, subtotal });
    }

    // —— 3. 写入订单主表 ——
    const result = db.prepare(`
      INSERT INTO orders (order_no, table_no, total_amount, item_count, remark, status)
      VALUES (?, ?, ?, ?, ?, '待处理')
    `).run(orderNo, String(tableNo), totalAmount, itemCount, String(remark).slice(0, 200));

    const orderId = result.lastInsertRowid;

    // —— 4. 写入订单明细，并同步扣减库存、累加销量 ——
    const insertItem = db.prepare(`
      INSERT INTO order_item (order_id, dish_id, dish_name, emoji, price, count, subtotal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const updDish = db.prepare(`
      UPDATE dish SET sales = sales + ?, stock = stock - ? WHERE id = ?
    `);

    for (const { dish, count, subtotal } of detailRows) {
      insertItem.run(orderId, dish.id, dish.name, dish.emoji, dish.price, count, subtotal);
      updDish.run(count, count, dish.id);
    }
    refreshTableStatus(String(tableNo));   // 该桌标记为"使用中"

    db.exec('COMMIT');
    ok(res, findOrderByNo(orderNo), '下单成功');
  } catch (e) {
    db.exec('ROLLBACK');
    fail(res, e.message, 400);
  }
});

// ------------------------------------------------------------
// 订单列表
// ------------------------------------------------------------
router.get('/orders', (req, res) => {
  try {
    const { status } = req.query;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const where = [];
    const params = [];
    if (status) {
      where.push('status = ?');
      params.push(String(status));
    }

    const orders = db.prepare(`
      SELECT id, order_no AS orderNo, table_no AS tableNo, total_amount AS totalAmount,
             item_count AS itemCount, remark, status, created_at AS createdAt
        FROM orders
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY id DESC
       LIMIT ?
    `).all(...params, limit);

    // 批量补充明细
    const stmt = db.prepare(`
      SELECT id, dish_id AS dishId, dish_name AS name, emoji, price, count, subtotal
        FROM order_item WHERE order_id = ? ORDER BY id ASC
    `);
    for (const o of orders) {
      o.items = stmt.all(o.id);
    }

    ok(res, orders);
  } catch (e) {
    fail(res, e.message);
  }
});

// ------------------------------------------------------------
// 订单详情
// ------------------------------------------------------------
router.get('/orders/:orderNo', (req, res) => {
  try {
    const order = findOrderByNo(req.params.orderNo);
    if (!order) return fail(res, '订单不存在', 404);
    ok(res, order);
  } catch (e) {
    fail(res, e.message);
  }
});

// ------------------------------------------------------------
// 更新订单状态（模拟后厨/收银端操作）
// 请求体：{ status: '制作中' }
// ------------------------------------------------------------
router.put('/orders/:orderNo/status', (req, res) => {
  try {
    const { status } = req.body || {};
    if (!ORDER_STATUS.includes(status)) {
      return fail(res, `订单状态只能是：${ORDER_STATUS.join(' / ')}`, 400);
    }

    const order = db.prepare('SELECT id, status FROM orders WHERE order_no = ?').get(req.params.orderNo);
    if (!order) return fail(res, '订单不存在', 404);

    db.exec('BEGIN');
    try {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, order.id);

      // 订单取消时回滚库存；订单完成/取消后重算餐桌状态
      if (status === '已取消') {
        const items = db.prepare('SELECT dish_id, count FROM order_item WHERE order_id = ?').all(order.id);
        const back = db.prepare('UPDATE dish SET stock = stock + ?, sales = sales - ? WHERE id = ?');
        for (const it of items) back.run(it.count, it.count, it.dish_id);
      }

      if (status === '已完成' || status === '已取消') {
        const o = db.prepare('SELECT table_no FROM orders WHERE id = ?').get(order.id);
        refreshTableStatus(o.table_no);
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    ok(res, findOrderByNo(req.params.orderNo), '状态更新成功');
  } catch (e) {
    fail(res, e.message);
  }
});

module.exports = router;
