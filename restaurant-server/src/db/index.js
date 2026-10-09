/**
 * 数据库连接模块
 * 使用 Node.js 22 内置的 node:sqlite 模块，无需安装任何数据库驱动/服务端。
 * 数据库文件：server/data/restaurant.db
 */
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

// 数据目录（不存在则自动创建）
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFile = path.join(dataDir, 'restaurant.db');
const db = new DatabaseSync(dbFile);

// 开启外键约束（SQLite 默认关闭）
db.exec('PRAGMA foreign_keys = ON;');

// 只有初始化时才需要写文件，查询用内存缓存即可
db.exec('PRAGMA journal_mode = WAL;');

module.exports = { db, dbFile, dataDir };
