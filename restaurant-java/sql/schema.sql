-- ============================================================
-- 模拟餐厅点餐系统 · MySQL 建表脚本
-- 数据库：MySQL 8.0+ / 字符集 utf8mb4 / 存储引擎 InnoDB
-- 执行方式：mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS restaurant
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

USE restaurant;

-- 按依赖关系倒序删除，方便重复执行（子表在前）
DROP TABLE IF EXISTS order_item;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS dish;
DROP TABLE IF EXISTS dining_table;
DROP TABLE IF EXISTS category;

-- ------------------------------------------------------------
-- 1. 菜品分类表 category
-- ------------------------------------------------------------
CREATE TABLE category (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  name       VARCHAR(32)  NOT NULL                COMMENT '分类名称',
  sort_order INT          NOT NULL DEFAULT 0      COMMENT '排序号，越小越靠前',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '菜品分类表';

-- ------------------------------------------------------------
-- 2. 菜品表 dish
-- ------------------------------------------------------------
CREATE TABLE dish (
  id          INT UNSIGNED   NOT NULL AUTO_INCREMENT COMMENT '菜品ID',
  category_id INT UNSIGNED   NOT NULL                COMMENT '所属分类ID',
  name        VARCHAR(64)    NOT NULL                COMMENT '菜品名称',
  price       DECIMAL(10, 2) NOT NULL                COMMENT '单价（元）',
  emoji       VARCHAR(16)    DEFAULT ''              COMMENT '菜品图标',
  description VARCHAR(255)   DEFAULT ''              COMMENT '菜品简介',
  sales       INT            NOT NULL DEFAULT 0      COMMENT '累计销量',
  stock       INT            NOT NULL DEFAULT 999    COMMENT '库存份数',
  status      TINYINT        NOT NULL DEFAULT 1      COMMENT '1在售 0停售',
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  KEY idx_dish_category (category_id),
  KEY idx_dish_status (status),
  CONSTRAINT fk_dish_category FOREIGN KEY (category_id) REFERENCES category (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '菜品表';

-- ------------------------------------------------------------
-- 3. 餐桌表 dining_table
-- ------------------------------------------------------------
CREATE TABLE dining_table (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '餐桌ID',
  table_no VARCHAR(16)  NOT NULL                COMMENT '桌号，如 A01',
  seats    TINYINT      NOT NULL DEFAULT 4      COMMENT '座位数',
  status   TINYINT      NOT NULL DEFAULT 0      COMMENT '0空闲 1使用中',
  PRIMARY KEY (id),
  UNIQUE KEY uk_table_no (table_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '餐桌表';

-- ------------------------------------------------------------
-- 4. 订单主表 orders
-- ------------------------------------------------------------
CREATE TABLE orders (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  order_no     VARCHAR(32)    NOT NULL                COMMENT '订单号',
  table_no     VARCHAR(16)    NOT NULL                COMMENT '桌号',
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00   COMMENT '订单总金额',
  item_count   INT            NOT NULL DEFAULT 0      COMMENT '菜品总份数',
  remark       VARCHAR(255)   DEFAULT ''              COMMENT '顾客备注',
  status       VARCHAR(16)    NOT NULL DEFAULT '待处理' COMMENT '待处理/制作中/已完成/已取消',
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_orders_created (created_at),
  KEY idx_orders_status (status),
  KEY idx_orders_table (table_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '订单主表';

-- ------------------------------------------------------------
-- 5. 订单明细表 order_item
--    说明：dish_name / price 为下单时的数据快照，
--          防止菜品后续改名改价导致历史订单金额失真。
-- ------------------------------------------------------------
CREATE TABLE order_item (
  id        INT UNSIGNED   NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  order_id  INT UNSIGNED   NOT NULL                COMMENT '所属订单ID',
  dish_id   INT UNSIGNED   NOT NULL                COMMENT '菜品ID',
  dish_name VARCHAR(64)    NOT NULL                COMMENT '菜品名称（快照）',
  emoji     VARCHAR(16)    DEFAULT ''              COMMENT '菜品图标（快照）',
  price     DECIMAL(10, 2) NOT NULL                COMMENT '下单时单价（快照）',
  count     INT            NOT NULL                COMMENT '数量',
  subtotal  DECIMAL(10, 2) NOT NULL                COMMENT '小计 = 单价 × 数量',
  PRIMARY KEY (id),
  KEY idx_item_order (order_id),
  CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '订单明细表';

-- ------------------------------------------------------------
-- 6. 视图：订单详情（把主表与明细关联，方便查询报表）
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_order_detail AS
SELECT o.order_no,
       o.table_no,
       o.status,
       o.created_at,
       i.dish_name,
       i.price,
       i.count,
       i.subtotal
  FROM orders o
  JOIN order_item i ON i.order_id = o.id;
