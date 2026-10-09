package com.restaurant.service;

import com.restaurant.common.BizException;
import com.restaurant.dto.OrderCreateDTO;
import com.restaurant.entity.DiningTable;
import com.restaurant.entity.Dish;
import com.restaurant.entity.Order;
import com.restaurant.entity.OrderItem;
import com.restaurant.mapper.MenuMapper;
import com.restaurant.mapper.OrderMapper;
import com.restaurant.mapper.TableMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * 订单业务：下单、查询、状态流转
 *
 * 关键设计：
 * 1. 下单过程使用 @Transactional 事务，订单主表、订单明细、菜品库存销量三步要么全成功要么全回滚；
 * 2. 金额一律以数据库中的菜品单价计算，不信任前端传入的价格；
 * 3. 订单明细保存菜品名称与价格快照，菜品后续改名改价不影响历史订单。
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    /** 允许的订单状态（状态机约束） */
    public static final List<String> ORDER_STATUS = List.of("待处理", "制作中", "已完成", "已取消");

    private static final DateTimeFormatter NO_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final Random RANDOM = new Random();

    private final OrderMapper orderMapper;
    private final MenuMapper menuMapper;
    private final TableMapper tableMapper;

    /** 生成订单号：D + 年月日时分秒 + 3位随机数 */
    private String buildOrderNo() {
        return "D" + LocalDateTime.now().format(NO_FORMAT) + String.format("%03d", RANDOM.nextInt(1000));
    }

    /**
     * 提交订单（事务方法）
     */
    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(OrderCreateDTO dto) {
        // 1. 校验桌号
        DiningTable table = tableMapper.selectByTableNo(dto.getTableNo());
        if (table == null) {
            throw new BizException("桌号 " + dto.getTableNo() + " 不存在");
        }

        // 2. 逐条校验菜品、计算金额（价格以数据库为准）
        BigDecimal totalAmount = BigDecimal.ZERO;
        int itemCount = 0;
        List<OrderItem> details = new ArrayList<>();

        for (OrderCreateDTO.Item item : dto.getItems()) {
            Dish dish = menuMapper.selectDishById(item.getDishId());
            if (dish == null) {
                throw new BizException("菜品 ID=" + item.getDishId() + " 不存在");
            }
            if (dish.getStatus() == null || dish.getStatus() != 1) {
                throw new BizException("菜品「" + dish.getName() + "」已停售");
            }
            if (dish.getStock() < item.getCount()) {
                throw new BizException("菜品「" + dish.getName() + "」库存不足（剩余 " + dish.getStock() + " 份）");
            }

            BigDecimal subtotal = dish.getPrice().multiply(BigDecimal.valueOf(item.getCount()));
            totalAmount = totalAmount.add(subtotal);
            itemCount += item.getCount();

            OrderItem detail = new OrderItem();
            detail.setDishId(dish.getId());
            detail.setName(dish.getName());
            detail.setEmoji(dish.getEmoji());
            detail.setPrice(dish.getPrice());
            detail.setCount(item.getCount());
            detail.setSubtotal(subtotal);
            details.add(detail);
        }

        // 3. 写入订单主表
        Order order = new Order();
        order.setOrderNo(buildOrderNo());
        order.setTableNo(dto.getTableNo());
        order.setTotalAmount(totalAmount);
        order.setItemCount(itemCount);
        order.setRemark(dto.getRemark() == null ? "" : dto.getRemark());
        order.setStatus("待处理");
        orderMapper.insertOrder(order);

        // 4. 写入明细，并扣减库存、累加销量
        for (OrderItem detail : details) {
            detail.setOrderId(order.getId());
            orderMapper.insertItem(detail);
            menuMapper.addSalesAndDecreaseStock(detail.getDishId(), detail.getCount());
        }

        // 5. 该桌标记为使用中
        tableMapper.refreshStatusByActiveOrders(order.getTableNo());

        return getByOrderNo(order.getOrderNo());
    }

    /** 按订单号查询订单详情（含明细） */
    public Order getByOrderNo(String orderNo) {
        Order order = orderMapper.selectByOrderNo(orderNo);
        if (order == null) {
            throw new BizException("订单不存在", 404);
        }
        order.setItems(orderMapper.selectItemsByOrderId(order.getId()));
        return order;
    }

    /** 查询订单列表（含明细） */
    public List<Order> listOrders(String status, Integer limit) {
        int size = (limit == null || limit <= 0) ? 20 : Math.min(limit, 100);
        List<Order> orders = orderMapper.selectOrders(status, size);
        for (Order order : orders) {
            order.setItems(orderMapper.selectItemsByOrderId(order.getId()));
        }
        return orders;
    }

    /**
     * 更新订单状态
     * 取消订单时回退库存与销量；完成或取消后重算餐桌状态
     */
    @Transactional(rollbackFor = Exception.class)
    public Order updateStatus(String orderNo, String status) {
        if (status == null || !ORDER_STATUS.contains(status)) {
            throw new BizException("订单状态只能是：" + String.join(" / ", ORDER_STATUS));
        }

        Order order = orderMapper.selectByOrderNo(orderNo);
        if (order == null) {
            throw new BizException("订单不存在", 404);
        }
        if ("已取消".equals(order.getStatus())) {
            throw new BizException("该订单已取消，请勿重复操作");
        }

        orderMapper.updateStatus(order.getId(), status);

        if ("已取消".equals(status)) {
            for (OrderItem item : orderMapper.selectItemsByOrderId(order.getId())) {
                menuMapper.rollbackSalesAndStock(item.getDishId(), item.getCount());
            }
        }
        if ("已完成".equals(status) || "已取消".equals(status)) {
            tableMapper.refreshStatusByActiveOrders(order.getTableNo());
        }

        return getByOrderNo(orderNo);
    }
}
