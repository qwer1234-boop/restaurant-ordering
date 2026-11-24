package com.restaurant.controller;

import com.restaurant.common.BizException;
import com.restaurant.common.Result;
import com.restaurant.dto.DishSaveDTO;
import com.restaurant.dto.OwnerLoginDTO;
import com.restaurant.entity.Dish;
import com.restaurant.entity.Order;
import com.restaurant.service.MenuService;
import com.restaurant.service.OrderService;
import com.restaurant.service.OwnerAuthService;
import com.restaurant.service.StatsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 老板端接口。
 *
 * 统一约定：
 * 1. 除 /login 外，所有接口都要求请求头 X-Owner-Token；
 * 2. 返回值统一包成 Result，前端只看 code / message / data；
 * 3. Controller 只负责收参数和调 Service，业务规则放在 Service 里。
 *
 * 接口清单：
 *   POST /api/owner/login                    登录，返回 X-Owner-Token
 *   GET  /api/owner/orders                   全部订单（可按状态筛选）
 *   PUT  /api/owner/orders/{orderNo}/status  接单 / 出餐 / 取消
 *   GET  /api/owner/dishes                   全部菜品（含停售）
 *   POST /api/owner/dishes                   新增菜品
 *   PUT  /api/owner/dishes/{id}              编辑菜品
 *   PUT  /api/owner/dishes/{id}/status       上架 / 停售
 *   GET  /api/owner/stats                    经营统计（概况 + 热销 + 分类占比）
 */
@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
public class OwnerController {

    private final OwnerAuthService ownerAuthService;
    private final OrderService orderService;
    private final MenuService menuService;
    private final StatsService statsService;

    /**
     * 老板登录：校验密码，成功后签发一个 8 小时有效的内存 token。
     * 前端拿到 token 后，后续请求放进 X-Owner-Token 请求头。
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody @Valid OwnerLoginDTO dto) {
        return Result.ok(ownerAuthService.login(dto.getPassword()), "登录成功");
    }

    /**
     * 订单看板：按状态筛选订单，默认最多 20 条，最多 100 条。
     * 状态为空时返回全部；前端根据状态做标签页筛选。
     */
    @GetMapping("/orders")
    public Result<List<Order>> orders(@RequestParam(required = false) String status,
                                      @RequestParam(required = false) Integer limit) {
        return Result.ok(orderService.listOrders(status, limit));
    }

    /**
     * 接单 / 出餐 / 取消。
     * 状态能不能从当前值变成目标值，由 OrderService 的状态机统一校验；
     * 取消时还会在同一事务里回滚库存和销量。
     */
    @PutMapping("/orders/{orderNo}/status")
    public Result<Order> updateOrderStatus(@PathVariable String orderNo,
                                           @RequestBody Map<String, String> body) {
        String status = body == null ? null : body.get("status");
        return Result.ok(orderService.updateStatus(orderNo, status), "状态更新成功");
    }

    /**
     * 老板端菜品列表：包含停售菜品，方便老板重新上架。
     * 顾客端只会在 /api/dishes 看到在售菜品。
     */
    @GetMapping("/dishes")
    public Result<List<Dish>> dishes() {
        return Result.ok(menuService.listAllDishes());
    }

    /**
     * 新增菜品：分类、名称、价格、库存由 DishSaveDTO 做参数校验；
     * 销量从 0 开始，后续由下单 / 取消订单维护。
     */
    @PostMapping("/dishes")
    public Result<Dish> createDish(@RequestBody @Valid DishSaveDTO dto) {
        return Result.ok(menuService.createDish(dto), "新增菜品成功");
    }

    /**
     * 编辑菜品：只改基础信息，销量不允许在这里修改。
     * 这样能避免老板手动改销量导致统计和订单对不上。
     */
    @PutMapping("/dishes/{id}")
    public Result<Dish> updateDish(@PathVariable Integer id, @RequestBody @Valid DishSaveDTO dto) {
        return Result.ok(menuService.updateDish(id, dto), "保存菜品成功");
    }

    /**
     * 上架 / 停售：采用软下架，只改 status。
     * 停售后顾客菜单不再显示，但历史订单明细里的菜品快照仍然保留。
     */
    @PutMapping("/dishes/{id}/status")
    public Result<Dish> updateDishStatus(@PathVariable Integer id,
                                         @RequestBody Map<String, Integer> body) {
        Integer status = body == null ? null : body.get("status");
        if (status == null) {
            throw new BizException("缺少菜品状态 status");
        }
        return Result.ok(menuService.updateDishStatus(id, status), "菜品状态已更新");
    }

    /**
     * 经营统计：一次返回看板需要的三块数据。
     * summary：今日 / 累计营业额、客单价、待处理订单；
     * topDishes：热销菜品 Top 5；
     * categoryStats：分类营业额占比。
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> stats() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("summary", statsService.summary());
        data.put("topDishes", statsService.topDishes(5));
        data.put("categoryStats", statsService.categoryStats());
        return Result.ok(data);
    }
}
