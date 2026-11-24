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
 * 顾客 / 通用订单接口。
 *
 * 注意：老板端有独立的 /api/owner/orders 接口；
 * 这里的 updateStatus 目前没有鉴权，只适合课程演示时模拟后厨操作，
 * 生产环境应限制为老板角色或直接移除。
 *
 *   POST /api/orders                    提交订单
 *   GET  /api/orders                    订单列表
 *   GET  /api/orders/{orderNo}          订单详情
 *   PUT  /api/orders/{orderNo}/status   更新订单状态（演示用）
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** 提交订单：金额、库存、事务都由 OrderService 统一处理。 */
    @PostMapping
    public Result<Order> create(@RequestBody @Valid OrderCreateDTO dto) {
        return Result.ok(orderService.createOrder(dto), "下单成功");
    }

    /** 订单列表：status 可选，limit 由 Service 限制上限。 */
    @GetMapping
    public Result<List<Order>> list(@RequestParam(required = false) String status,
                                    @RequestParam(required = false) Integer limit) {
        return Result.ok(orderService.listOrders(status, limit));
    }

    /** 订单详情：包含订单主表和明细快照。 */
    @GetMapping("/{orderNo}")
    public Result<Order> detail(@PathVariable String orderNo) {
        return Result.ok(orderService.getByOrderNo(orderNo));
    }

    /**
     * 更新订单状态：状态机校验和取消回滚都在 Service 里。
     * 演示用接口；生产环境应加老板端鉴权。
     */
    @PutMapping("/{orderNo}/status")
    public Result<Order> updateStatus(@PathVariable String orderNo,
                                      @RequestBody Map<String, String> body) {
        String status = body == null ? null : body.get("status");
        return Result.ok(orderService.updateStatus(orderNo, status), "状态更新成功");
    }
}
