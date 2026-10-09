package com.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单（表 orders）
 */
@Data
public class Order {

    /** 订单ID */
    private Integer id;

    /** 订单号，如 D20261001203632 */
    private String orderNo;

    /** 桌号 */
    private String tableNo;

    /** 订单总金额 */
    private BigDecimal totalAmount;

    /** 菜品总份数 */
    private Integer itemCount;

    /** 顾客备注 */
    private String remark;

    /** 状态：待处理 / 制作中 / 已完成 / 已取消 */
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /** 订单明细（非表字段，查询时填充） */
    private List<OrderItem> items;
}
