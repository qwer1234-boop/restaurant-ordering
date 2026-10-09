# 模拟餐厅点餐微信小程序（课程作业）

前后端分离的点餐系统：**小程序端（原生 WXML/WXSS/JS） + Java 后端（Spring Boot + MyBatis） + MySQL 数据库**

## 一、如何运行

### 第 1 步：启动 MySQL（端口 3307）

```bash
C:\Users\syxlw\mysql\mysql-8.4.3-winx64\bin\mysqld.exe --defaults-file="C:/Users/syxlw/mysql/my.ini" --console
```

### 第 2 步：启动 Java 后端（端口 8080）

```bash
cd ../restaurant-java
mvn spring-boot:run
```

### 第 3 步：运行小程序

1. 打开微信开发者工具 → 导入项目 → 选择本文件夹 `restaurant-miniprogram`。
2. AppID 选择 **"测试号"（touristappid）**，无需注册。
3. 确认已勾选 **详情 → 本地设置 → 不校验合法域名**（项目配置中默认已关闭域名校验）。
4. 编译后即可体验完整点餐流程。

> 菜品图标使用 emoji，不依赖任何图片资源。
> 后端未启动时小程序会自动降级为本地数据演示，界面会提示数据来源，不会白屏。
>
> 如需切换到 Node 版后端（Express + SQLite，端口 3000），修改 `utils/api.js` 中的 `BASE_URL` 即可。

## 二、功能清单

| 模块 | 功能 | 数据来源 |
| ---- | ---- | -------- |
| 点餐页 | 左侧分类导航（热菜/凉菜/主食/饮品），右侧菜品列表，点击 ＋ 加购 | `GET /api/categories`、`GET /api/dishes` |
| 购物车 | 底部栏显示总数量、总价，可展开明细，支持增减、清空 | 前端 `app.globalData.cart` |
| 订单确认 | 展示明细、快选桌号（来自餐桌表）、填备注，提交下单 | `GET /api/tables`、`POST /api/orders` |
| 历史订单 | 订单列表 + 展开查看明细，支持下拉刷新 | `GET /api/orders` |
| 数据兜底 | 后端未启动时自动使用本地数据，界面有来源提示 | `data/dishes.js` + `wx.setStorageSync` |

## 三、项目结构

```
restaurant-miniprogram/
├── app.js                 # 小程序入口，管理购物车与订单全局状态
├── app.json               # 全局配置（页面路径、tabBar、导航栏）
├── app.wxss               # 全局样式
├── project.config.json    # 开发者工具项目配置
├── sitemap.json
├── utils/
│   └── api.js             # 后端接口封装（BASE_URL、统一请求方法）
├── data/
│   └── dishes.js          # 本地兜底菜品数据
└── pages/
    ├── index/             # 点餐页（核心页面）
    ├── confirm/           # 订单确认页
    └── orders/            # 历史订单页
```

## 四、技术要点（可用于答辩/报告）

- **前后端分离**：小程序通过 `wx.request` 调用 REST 接口，`utils/api.js` 统一封装请求与错误处理。
- **Promise 化请求**：把回调式的 `wx.request` 封装为 Promise，页面里用 `.then/.catch` 组织异步流程。
- **优雅降级**：接口失败时自动切换本地数据并在界面提示，保证无后端环境也能正常演示。
- **数据驱动视图**：菜单、购物车、订单均通过 `setData` 渲染，数据变化界面自动刷新。
- **列表渲染与事件传参**：`wx:for` + `wx:key` 渲染列表，通过 `data-id` / `data-no` 传递参数。
- **全局状态共享**：购物车与订单缓存在 `app.globalData`，通过 `getApp()` 跨页面访问。
- **金额显示规范**：`¥{{item.count * item.price}}` 在模板中直接计算小计，保持与后端 `subtotal` 一致。

## 五、后端说明

后端代码、数据库设计文档（数据字典 / E-R / SQL 示例）见同级目录：

```
restaurant-server/
├── README.md                   启动方式与接口清单
└── docs/数据库设计说明.md        数据库设计文档
```
