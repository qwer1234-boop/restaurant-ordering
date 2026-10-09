package com.restaurant.mapper;

import com.restaurant.entity.DiningTable;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 餐桌数据访问
 */
public interface TableMapper {

    /** 查询全部餐桌 */
    List<DiningTable> selectAll();

    /** 按桌号查询餐桌（用于下单时校验桌号是否存在） */
    DiningTable selectByTableNo(@Param("tableNo") String tableNo);

    /**
     * 根据该桌是否仍有进行中（待处理 / 制作中）的订单，重算餐桌状态
     * 0 空闲 / 1 使用中
     */
    int refreshStatusByActiveOrders(@Param("tableNo") String tableNo);
}
