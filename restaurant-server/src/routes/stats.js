/**
 * 统计报表接口（用于作业报告展示数据库分析能力）
 *   GET /api/stats/summary   经营概况：订单数、营业额、客单价
 *   GET /api/stats/top       菜品销量排行 TOP N
 *   GET /api/stats/category  分类营业额占比
 */
const express = require('express');
const { db } = require('../db');
const { ok, fail } = require('../utils/response');

const router = express.Router();

// 经营概况
router.get('/summary', (req, res) => {
  try {
    const total = db.prepare(`
      SELECT COUNT(*) AS orderCount,
             IFNULL(SUM(total_amount), 0) AS turnover,
             IFNULL(SUM(item_count), 0)   AS dishCount
        FROM orders
       WHERE status != '已取消'
    `).get();

    const today = db.prepare(`
      SELECT COUNT(*) AS orderCount,
             IFNULL(SUM(total_amount), 0) AS turnover
        FROM orders
       WHERE status != '已取消'
         AND date(created_at) = date('now', 'localtime')
    `).get();

    // 客单价 = 营业额 / 订单数
    total.avgOrderAmount = total.orderCount
      ? Number((total.turnover / total.orderCount).toFixed(2))
      : 0;

    const tableStat = db.prepare(`
      SELECT SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS usingCount,
             COUNT(*) AS totalCount
        FROM dining_table
    `).get();

    ok(res, { total, today, tableStat });
  } catch (e) {
    fail(res, e.message);
  }
});

// 菜品销量排行
router.get('/top', (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 50);
    const rows = db.prepare(`
      SELECT i.dish_id AS dishId,
             i.dish_name AS name,
             i.emoji,
             SUM(i.count)  AS soldCount,
             SUM(i.subtotal) AS amount
        FROM order_item i
        JOIN orders o ON o.id = i.order_id
       WHERE o.status != '已取消'
       GROUP BY i.dish_id, i.dish_name
       ORDER BY soldCount DESC
       LIMIT ?
    `).all(limit);
    ok(res, rows);
  } catch (e) {
    fail(res, e.message);
  }
});

// 分类营业额占比
router.get('/category', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT c.name AS categoryName,
             IFNULL(SUM(CASE WHEN o.id IS NOT NULL THEN i.count    ELSE 0 END), 0) AS soldCount,
             IFNULL(SUM(CASE WHEN o.id IS NOT NULL THEN i.subtotal ELSE 0 END), 0) AS amount
        FROM category c
        LEFT JOIN dish d        ON d.category_id = c.id
        LEFT JOIN order_item i  ON i.dish_id = d.id
        LEFT JOIN orders o      ON o.id = i.order_id AND o.status != '已取消'
       GROUP BY c.id
       ORDER BY amount DESC
    `).all();
    ok(res, rows);
  } catch (e) {
    fail(res, e.message);
  }
});

module.exports = router;
