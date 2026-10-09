/**
 * 模拟餐厅点餐小程序 · 后端服务入口
 * 技术栈：Node.js + Express + SQLite（node:sqlite 内置模块）
 *
 * 启动：npm start（默认 http://localhost:3000）
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const { db, dbFile } = require('./src/db');
const menuRouter = require('./src/routes/menu');
const tablesRouter = require('./src/routes/tables');
const ordersRouter = require('./src/routes/orders');
const statsRouter = require('./src/routes/stats');
const { ok } = require('./src/utils/response');

const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------
// 首次运行时自动建库建表并写入初始数据，避免"忘记初始化"导致报错
// ------------------------------------------------------------
(function ensureDatabase() {
  const { c } = db.prepare(`
    SELECT COUNT(*) AS c FROM sqlite_master WHERE type = 'table' AND name = 'dish'
  `).get();

  if (c === 0) {
    console.info('[init] 未检测到数据表，正在自动初始化数据库…');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'src', 'db', 'schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'src', 'db', 'seed.sql'), 'utf8');
    db.exec(schemaSql);
    db.exec(seedSql);
    console.info('[init] 初始化完成');
  }
})();

const app = express();

app.use(cors());                              // 允许小程序 / 浏览器跨域调用
app.use(express.json({ limit: '1mb' }));      // 解析 JSON 请求体

// 简易请求日志，方便调试
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.info(`[${new Date().toLocaleTimeString('zh-CN')}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// 健康检查
app.get('/api/health', (req, res) => {
  ok(res, { service: 'restaurant-server', dbFile, time: new Date().toLocaleString('zh-CN') });
});

// 业务路由
app.use('/api', menuRouter);      // /api/categories、/api/dishes
app.use('/api', tablesRouter);    // /api/tables
app.use('/api', ordersRouter);    // /api/orders
app.use('/api/stats', statsRouter);  // /api/stats/summary、/api/stats/top、/api/stats/category

// 404
app.use((req, res) => {
  res.status(404).json({ code: 404, message: `接口不存在：${req.method} ${req.originalUrl}`, data: null });
});

// 统一异常处理
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ code: 500, message: err.message || '服务器内部错误', data: null });
});

app.listen(PORT, () => {
  console.info('==================================================');
  console.info('  模拟餐厅点餐后端服务已启动');
  console.info(`  地址：http://localhost:${PORT}`);
  console.info(`  健康检查：http://localhost:${PORT}/api/health`);
  console.info(`  数据库文件：${dbFile}`);
  console.info('==================================================');
});
