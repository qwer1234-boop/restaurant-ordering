/**
 * 数据库初始化脚本
 * 用法：npm run init-db
 * 作用：建表（schema.sql） + 灌入初始数据（seed.sql）
 */
const fs = require('fs');
const path = require('path');
const { db, dbFile } = require('./index');

const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

console.info('正在初始化数据库：', dbFile);

// 1. 建表
db.exec(schemaSql);
console.info('√ 建表完成（category / dish / dining_table / orders / order_item）');

// 2. 灌入初始数据
db.exec(seedSql);
console.info('√ 初始数据写入完成');

// 3. 校验
const stat = {};
for (const t of ['category', 'dish', 'dining_table', 'orders', 'order_item']) {
  const row = db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get();
  stat[t] = row.c;
}
console.info('√ 数据统计：', stat);
console.info('数据库初始化完成，可以执行 npm start 启动服务。');
