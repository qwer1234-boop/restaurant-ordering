/**
 * 餐桌相关接口
 *   GET /api/tables   查询全部餐桌及占用状态
 */
const express = require('express');
const { db } = require('../db');
const { ok, fail } = require('../utils/response');

const router = express.Router();

router.get('/tables', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, table_no AS tableNo, seats, status
        FROM dining_table
       ORDER BY table_no ASC
    `).all();
    ok(res, rows);
  } catch (e) {
    fail(res, e.message);
  }
});

module.exports = router;
