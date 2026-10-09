# 模拟餐厅点餐系统 · 后端服务

技术栈：**Node.js + Express + SQLite**（使用 Node 22 内置的 `node:sqlite`，无需安装 MySQL，也不用装任何数据库驱动）

## 一、快速启动

本机 Node 版本需 **≥ 22.5**（`node -v` 检查）。

```bash
cd restaurant-server
npm install      # 安装 express、cors 两个依赖
npm run init-db  # 建表 + 写入初始数据（只需执行一次）
npm start        # 启动服务，默认 http://localhost:3000
```

看到下面这段就说明启动成功：

```
  模拟餐厅点餐后端服务已启动
  地址：http://localhost:3000
  健康检查：http://localhost:3000/api/health
```

> 若忘记执行 `npm run init-db` 也没关系，服务启动时会自动检测并初始化数据库。

在浏览器打开 <http://localhost:3000/api/dishes> 能看到 JSON 数据，即代表后端正常。

## 二、目录结构

```
restaurant-server/
├── server.js                  服务入口（Express 应用、路由挂载、异常处理）
├── package.json
├── data/
│   └── restaurant.db          SQLite 数据库文件（首次初始化后生成）
├── docs/
│   └── 数据库设计说明.md       数据库设计文档（数据字典、E-R、SQL 示例）
└── src/
    ├── db/
    │   ├── schema.sql         建表脚本（5 张表 + 索引）
    │   ├── seed.sql           初始数据（4 分类 / 13 菜品 / 8 餐桌）
    │   ├── index.js           数据库连接（node:sqlite）
    │   └── init.js            初始化脚本入口
    ├── routes/
    │   ├── menu.js            分类与菜品接口
    │   ├── tables.js          餐桌接口
    │   ├── orders.js          订单接口（下单事务、状态更新）
    │   └── stats.js           统计报表接口
    └── utils/
        └── response.js        统一响应格式
```

## 三、接口一览

| 方法 | 路径 | 说明 |
| ---- | ---- | ---- |
| GET | `/api/health` | 健康检查 |
| GET | `/api/categories` | 分类列表（含菜品数量） |
| GET | `/api/dishes?categoryId=1&keyword=鸡` | 菜品列表 |
| GET | `/api/dishes/:id` | 菜品详情 |
| GET | `/api/tables` | 餐桌列表 |
| POST | `/api/orders` | 提交订单 |
| GET | `/api/orders?status=待处理&limit=20` | 订单列表 |
| GET | `/api/orders/:orderNo` | 订单详情 |
| PUT | `/api/orders/:orderNo/status` | 更新订单状态 |
| GET | `/api/stats/summary` | 经营概况 |
| GET | `/api/stats/top` | 菜品销量排行 |
| GET | `/api/stats/category` | 分类营业额占比 |

### 下单请求示例

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"tableNo":"A01","remark":"不要辣","items":[{"dishId":1,"count":2},{"dishId":5,"count":1}]}'
```

响应：

```json
{
  "code": 0,
  "message": "下单成功",
  "data": {
    "orderNo": "D20261001203249578",
    "tableNo": "A01",
    "totalAmount": 64,
    "itemCount": 3,
    "status": "待处理",
    "items": [
      { "dishId": 1, "name": "宫保鸡丁", "price": 28, "count": 2, "subtotal": 56 },
      { "dishId": 5, "name": "凉拌黄瓜", "price": 8,  "count": 1, "subtotal": 8 }
    ]
  }
}
```

## 四、数据库

共 5 张表，详见 [docs/数据库设计说明.md](docs/数据库设计说明.md)：

| 表名 | 中文名 |
| ---- | ------ |
| category | 菜品分类表 |
| dish | 菜品表 |
| dining_table | 餐桌表 |
| orders | 订单主表 |
| order_item | 订单明细表 |

重置数据：重新执行 `npm run init-db` 即可（会清空订单、还原菜单和库存）。

## 五、小程序端如何连接

小程序 `utils/api.js` 中的 `BASE_URL` 指向 `http://localhost:3000/api`。
在微信开发者工具中需确认已勾选 **详情 → 本地设置 → 不校验合法域名**（项目配置中默认已关闭域名校验），否则 `localhost` 请求会被拦截。

> 若要在真机上测试，把 `BASE_URL` 改成电脑的局域网 IP（如 `http://192.168.1.5:3000/api`），并保证手机与电脑在同一 WiFi 下。
