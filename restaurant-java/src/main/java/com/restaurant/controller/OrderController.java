package com.restaurant.controller;

import com.restaurant.common.Result;
import com.restaurant.dto.OrderCreateDTO;
import com.restaurant.entity.Order;
import com.restaurant.service.OrderService;
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

import java.util.List;
import java.util.Map;

/**
 * 订单接口
 *   POST /api/orders                提交订单
 *   GET  /api/orders                订单列表
 *   GET  /api/orders/{orderNo}      订单详情
 *   PUT  /api/orders/{orderNo}/status  更新订单状态
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** 提交订单 */
    @PostMapping
    public Result<Order> create(@RequestBody @Valid OrderCreateDTO dto) {
        return Result.ok(orderService.createOrder(dto), "下单成功");
    }

    /** 订单列表 */
    @GetMapping
    public Result<List<Order>> list(@RequestParam(required = false) String status,
                                    @RequestParam(required = false) Integer limit) {
        return Result.ok(orderService.listOrders(status, limit));
    }

    /** 订单详情 */
    @GetMapping("/{orderNo}")
    public Result<Order> detail(@PathVariable String orderNo) {
        return Result.ok(orderService.getByOrderNo(orderNo));
    }

    /** 更新订单状态（模拟后厨/收银端操作） */
    @PutMapping("/{orderNo}/status")
    public Result<Order> updateStatus(@PathVariable String orderNo,
                                      @RequestBody Map<String, String> body) {
        String status = body == null ? null : body.get("status");
        return Result.ok(orderService.updateStatus(orderNo, status), "状态更新成功");
    }
}
