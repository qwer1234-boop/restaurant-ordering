# 模拟餐厅点餐系统 · Java 后端

技术栈：**Spring Boot 3.3.5 + MyBatis 3 + MySQL 8.4 + Java 21**
项目结构：Controller → Service → Mapper（XML）→ MySQL，标准分层架构。

前端小程序无需改动即可对接：接口路径与响应格式与后端约定完全一致（`{ code, message, data }`）。

## 一、环境准备（本机已装好，此节供了解/换机器时参考）

| 组件 | 版本 | 本机位置 |
| ---- | ---- | -------- |
| JDK | Zulu OpenJDK 21 | `C:\Program Files\Zulu\zulu-21` |
| Maven | 3.9.9 | `C:\Users\syxlw\maven\apache-maven-3.9.9` |
| MySQL | 8.4.3（端口 **3307**） | `C:\Users\syxlw\mysql\mysql-8.4.3-winx64` |

> 端口说明：本机 3306 已被一个系统里既有的旧版 MySQL 5.5 服务占用，为避免互相影响，本项目使用 **3307**。

### 启动 MySQL

```bash
C:\Users\syxlw\mysql\mysql-8.4.3-winx64\bin\mysqld.exe --defaults-file="C:/Users/syxlw/mysql/my.ini" --console
```

### 停止 MySQL

在该控制台窗口按 `Ctrl + C`，或结束 `mysqld.exe` 进程。

### 连接信息

```
host: 127.0.0.1    port: 3307
user: root         password: 123456
database: restaurant
```

## 二、初始化数据库（首次运行）

```bash
cd restaurant-java

# 建库建表（含 5 张表 + 1 个视图）
mysql -u root -p123456 -h 127.0.0.1 -P 3307 < sql/schema.sql

# 写入初始数据（4 分类 / 13 菜品 / 8 餐桌）
mysql -u root -p123456 -h 127.0.0.1 -P 3307 restaurant < sql/seed.sql
```

## 三、启动后端

```bash
cd restaurant-java
mvn clean package -DskipTests
mvn spring-boot:run
```

或直接运行打包好的 jar：

```bash
java -jar target/restaurant-java-1.0.0.jar
```

启动成功后访问 <http://localhost:8080/api/health> 应返回：

```json
{ "code": 0, "message": "ok",
  "data": { "service": "restaurant-java (Spring Boot 3 + MyBatis + MySQL)", "datasource": "jdbc:mysql://127.0.0.1:3307/restaurant" } }
```

## 四、接口清单

| 方法 | 路径 | 说明 |
| ---- | ---- | ---- |
| GET | `/api/health` | 健康检查 |
| GET | `/api/categories` | 分类列表（含菜品数量统计） |
| GET | `/api/dishes?categoryId=1&keyword=鸡` | 菜品列表（动态 SQL 查询） |
| GET | `/api/dishes/{id}` | 菜品详情 |
| GET | `/api/tables` | 餐桌列表 |
| POST | `/api/orders` | 提交订单（事务） |
| GET | `/api/orders?status=待处理&limit=20` | 订单列表（含明细） |
| GET | `/api/orders/{orderNo}` | 订单详情 |
| PUT | `/api/orders/{orderNo}/status` | 更新订单状态 |
| GET | `/api/stats/summary` | 经营概况 |
| GET | `/api/stats/top?limit=5` | 菜品销量排行（聚合查询） |
| GET | `/api/stats/category` | 分类营业额占比（多表联查） |

### 下单请求示例

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"tableNo":"A01","remark":"不要辣","items":[{"dishId":1,"count":2},{"dishId":5,"count":1}]}'
```

## 五、项目结构

```
restaurant-java/
├── pom.xml
├── sql/
│   ├── schema.sql                  MySQL 建表脚本（5 表 + 1 视图 + 索引 + 外键）
│   └── seed.sql                    MySQL 初始数据
├── src/main/java/com/restaurant/
│   ├── RestaurantApplication.java  启动类
│   ├── common/                     Result 统一响应、BizException、全局异常处理
│   ├── config/                     CorsConfig 跨域配置
│   ├── controller/                 接口层：Menu / Order / Stats / Health
│   ├── service/                    业务层：MenuService、OrderService、StatsService、TableService
│   ├── mapper/                     数据访问接口（MyBatis）
│   ├── entity/                     实体类：Category / Dish / DiningTable / Order / OrderItem
│   └── dto/                        请求参数对象（含校验注解）
└── src/main/resources/
    ├── application.yml             数据源、MyBatis、端口配置
    └── mapper/*.xml                SQL 映射文件（4 个）
```

## 六、技术要点（可用于答辩/报告）

1. **分层架构**：Controller 只做参数接收与响应封装，业务逻辑集中在 Service，SQL 集中在 Mapper XML，职责清晰。
2. **事务一致性**：`OrderService.createOrder()` 标注 `@Transactional(rollbackFor = Exception.class)`，订单主表、明细、库存销量三步任一失败整体回滚；`BizException` 由全局异常处理器统一转换为 `Result.fail`。
3. **金额计算精度**：金额统一使用 `BigDecimal`，避免 `double` 浮点误差；数据库对应字段为 `DECIMAL(10,2)`。
4. **数据校验**：`@Valid` + `@NotBlank` / `@NotEmpty` / `@Min` 完成入参校验，校验失败由 `GlobalExceptionHandler` 统一返回友好提示。
5. **动态 SQL**：菜品查询使用 `<if>` 标签实现"分类过滤 + 名称模糊搜索"可选条件组合。
6. **快照设计**：`order_item` 冗余保存 `dish_name`、`price`，保证历史订单金额不因菜品改价而变化。
7. **状态机与库存回滚**：订单状态限定为 待处理 → 制作中 → 已完成 / 已取消；取消时自动回退库存与销量，并重算餐桌占用状态。
8. **外键与索引**：`order_item.order_id` 外键级联删除，配合 `idx_orders_created`、`idx_item_order` 等索引提升查询效率。
