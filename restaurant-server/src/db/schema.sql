-- ============================================================
-- 模拟餐厅点餐系统 · 数据库建表脚本（SQLite）
-- 说明：SQLite 为轻量级嵌入式关系数据库，语法与 MySQL 高度一致，
--       如需迁移到 MySQL，仅需把 AUTOINCREMENT 改为 AUTO_INCREMENT、
--       把 TEXT 时间字段改为 DATETIME 即可。
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- 1. 菜品分类表 category
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS category (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,   -- 分类ID，主键
  name        TEXT    NOT NULL,                    -- 分类名称
  sort_order  INTEGER NOT NULL DEFAULT 0,          -- 排序号，越小越靠前
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))  -- 创建时间
);

-- ------------------------------------------------------------
-- 2. 菜品表 dish
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dish (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,   -- 菜品ID，主键
  category_id INTEGER NOT NULL,                    -- 所属分类ID，外键
  name        TEXT    NOT NULL,                    -- 菜品名称
  price       REAL    NOT NULL CHECK (price >= 0), -- 单价（元）
  emoji       TEXT    DEFAULT '',                  -- 图标（emoji，演示用）
  description TEXT    DEFAULT '',                  -- 简介/口味描述
  sales       INTEGER NOT NULL DEFAULT 0,          -- 累计销量
  stock       INTEGER NOT NULL DEFAULT 999,        -- 库存（份）
  status      INTEGER NOT NULL DEFAULT 1,          -- 状态：1在售 0停售
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (category_id) REFERENCES category (id)
);

CREATE INDEX IF NOT EXISTS idx_dish_category ON dish (category_id);
CREATE INDEX IF NOT EXISTS idx_dish_status   ON dish (status);

-- ------------------------------------------------------------
-- 3. 餐桌表 dining_table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dining_table (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,    -- 餐桌ID，主键
  table_no   TEXT    NOT NULL UNIQUE,              -- 桌号，如 A01
  seats      INTEGER NOT NULL DEFAULT 4,           -- 座位数
  status     INTEGER NOT NULL DEFAULT 0            -- 状态：0空闲 1使用中
);

-- ------------------------------------------------------------
-- 4. 订单主表 orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,  -- 订单ID，主键
  order_no     TEXT    NOT NULL UNIQUE,            -- 订单号，如 20261001202225001
  table_no     TEXT    NOT NULL,                   -- 桌号
  total_amount REAL    NOT NULL DEFAULT 0,         -- 订单总金额（元）
  item_count   INTEGER NOT NULL DEFAULT 0,         -- 菜品总份数
  remark       TEXT    DEFAULT '',                 -- 顾客备注（忌口、做法等）
  status       TEXT    NOT NULL DEFAULT '待处理',   -- 状态：待处理/制作中/已完成/已取消
  created_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders (status);

-- ------------------------------------------------------------
-- 5. 订单明细表 order_item
--    说明：dish_name / price 为下单时的"数据快照"，
--          防止菜品后续改名改价导致历史订单金额失真。
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_item (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,     -- 明细ID，主键
  order_id  INTEGER NOT NULL,                      -- 所属订单ID，外键
  dish_id   INTEGER NOT NULL,                      -- 菜品ID
  dish_name TEXT    NOT NULL,                      -- 菜品名称（快照）
  emoji     TEXT    DEFAULT '',                    -- 菜品图标（快照）
  price     REAL    NOT NULL CHECK (price >= 0),   -- 下单时单价（快照）
  count     INTEGER NOT NULL CHECK (count > 0),    -- 数量
  subtotal  REAL    NOT NULL,                      -- 小计 = 单价 × 数量
  FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_item_order ON order_item (order_id);
