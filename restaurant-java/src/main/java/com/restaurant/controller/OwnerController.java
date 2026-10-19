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
 * 老板端接口
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

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody @Valid OwnerLoginDTO dto) {
        return Result.ok(ownerAuthService.login(dto.getPassword()), "登录成功");
    }

    @GetMapping("/orders")
    public Result<List<Order>> orders(@RequestParam(required = false) String status,
                                      @RequestParam(required = false) Integer limit) {
        return Result.ok(orderService.listOrders(status, limit));
    }

    @PutMapping("/orders/{orderNo}/status")
    public Result<Order> updateOrderStatus(@PathVariable String orderNo,
                                           @RequestBody Map<String, String> body) {
        String status = body == null ? null : body.get("status");
        return Result.ok(orderService.updateStatus(orderNo, status), "状态更新成功");
    }

    @GetMapping("/dishes")
    public Result<List<Dish>> dishes() {
        return Result.ok(menuService.listAllDishes());
    }

    @PostMapping("/dishes")
    public Result<Dish> createDish(@RequestBody @Valid DishSaveDTO dto) {
        return Result.ok(menuService.createDish(dto), "新增菜品成功");
    }

    @PutMapping("/dishes/{id}")
    public Result<Dish> updateDish(@PathVariable Integer id, @RequestBody @Valid DishSaveDTO dto) {
        return Result.ok(menuService.updateDish(id, dto), "保存菜品成功");
    }

    @PutMapping("/dishes/{id}/status")
    public Result<Dish> updateDishStatus(@PathVariable Integer id,
                                         @RequestBody Map<String, Integer> body) {
        Integer status = body == null ? null : body.get("status");
        if (status == null) {
            throw new BizException("缺少菜品状态 status");
        }
        return Result.ok(menuService.updateDishStatus(id, status), "菜品状态已更新");
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> stats() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("summary", statsService.summary());
        data.put("topDishes", statsService.topDishes(5));
        data.put("categoryStats", statsService.categoryStats());
        return Result.ok(data);
    }
}
