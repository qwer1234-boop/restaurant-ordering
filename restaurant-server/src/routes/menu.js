/**
 * 菜单相关接口
 *   GET /api/categories          查询全部菜品分类（含分类下菜品数量）
 *   GET /api/dishes              查询菜品列表，支持 ?categoryId=1&keyword=鸡
 *   GET /api/dishes/:id          查询单个菜品详情
 */
const express = require('express');
const { db } = require('../db');
const { ok, fail } = require('../utils/response');

const router = express.Router();

// 分类列表
router.get('/categories', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT c.id,
             c.name,
             c.sort_order,
             COUNT(d.id) AS dishCount
        FROM category c
        LEFT JOIN dish d ON d.category_id = c.id AND d.status = 1
       GROUP BY c.id
       ORDER BY c.sort_order ASC
    `).all();
    ok(res, rows);
  } catch (e) {
    fail(res, e.message);
  }
});

// 菜品列表
router.get('/dishes', (req, res) => {
  try {
    const { categoryId, keyword } = req.query;
    const where = ['d.status = 1'];
    const params = [];

    if (categoryId) {
      where.push('d.category_id = ?');
      params.push(Number(categoryId));
    }
    if (keyword) {
      where.push('d.name LIKE ?');
      params.push(`%${keyword}%`);
    }

    const rows = db.prepare(`
      SELECT d.id,
             d.category_id AS categoryId,
             c.name       AS categoryName,
             d.name,
             d.price,
             d.emoji,
             d.description,
             d.sales,
             d.stock
        FROM dish d
        JOIN category c ON c.id = d.category_id
       WHERE ${where.join(' AND ')}
       ORDER BY d.category_id ASC, d.sales DESC
    `).all(...params);

    ok(res, rows);
  } catch (e) {
    fail(res, e.message);
  }
});

// 菜品详情
router.get('/dishes/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT d.id, d.category_id AS categoryId, d.name, d.price,
             d.emoji, d.description, d.sales, d.stock, d.status
        FROM dish d
       WHERE d.id = ?
    `).get(Number(req.params.id));

    if (!row) return fail(res, '菜品不存在', 404);
    ok(res, row);
  } catch (e) {
    fail(res, e.message);
  }
});

module.exports = router;
