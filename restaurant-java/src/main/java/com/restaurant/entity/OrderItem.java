package com.restaurant.entity;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 订单明细（表 order_item）
 * 其中 name、price 为下单时的数据快照，菜品后续改名改价不影响历史订单。
 */
@Data
public class OrderItem {

    /** 明细ID */
    private Integer id;

    /** 所属订单ID */
    private Integer orderId;

    /** 菜品ID */
    private Integer dishId;

    /** 菜品名称（快照），数据库字段 dish_name */
    private String name;

    /** 菜品图标（快照） */
    private String emoji;

    /** 下单时单价（快照） */
    private BigDecimal price;

    /** 数量 */
    private Integer count;

    /** 小计 = 单价 × 数量 */
    private BigDecimal subtotal;
}
