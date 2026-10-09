package com.restaurant.mapper;

import com.restaurant.entity.Order;
import com.restaurant.entity.OrderItem;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 订单数据访问（主表 + 明细表）
 */
public interface OrderMapper {

    /** 新增订单主表记录，主键回填到 order.id */
    int insertOrder(Order order);

    /** 新增订单明细 */
    int insertItem(OrderItem item);

    /** 按订单号查询订单（不含明细） */
    Order selectByOrderNo(@Param("orderNo") String orderNo);

    /** 查询订单列表，可按状态过滤 */
    List<Order> selectOrders(@Param("status") String status,
                             @Param("limit") Integer limit);

    /** 查询某订单的全部明细 */
    List<OrderItem> selectItemsByOrderId(@Param("orderId") Integer orderId);

    /** 更新订单状态 */
    int updateStatus(@Param("id") Integer id,
                     @Param("status") String status);
}
