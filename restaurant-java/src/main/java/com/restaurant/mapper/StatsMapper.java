package com.restaurant.mapper;

import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 统计报表数据访问（多表聚合查询）
 */
public interface StatsMapper {

    /** 累计经营数据：订单数、营业额、总份数 */
    Map<String, Object> selectTotal();

    /** 今日经营数据 */
    Map<String, Object> selectToday();

    /** 餐桌占用情况 */
    Map<String, Object> selectTableStat();

    /** 待处理订单数（老板端看板） */
    Integer selectPendingCount();

    /** 菜品销量排行 TOP N */
    List<Map<String, Object>> selectTopDishes(@Param("limit") Integer limit);

    /** 分类营业额占比 */
    List<Map<String, Object>> selectCategoryStats();
}
