package com.restaurant.service;

import com.restaurant.mapper.StatsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 统计报表业务：经营概况、菜品销量排行、分类营业额占比
 */
@Service
@RequiredArgsConstructor
public class StatsService {

    private final StatsMapper statsMapper;

    /** 经营概况：累计 / 今日订单数、营业额、客单价、餐桌占用 */
    public Map<String, Object> summary() {
        Map<String, Object> total = statsMapper.selectTotal();
        Map<String, Object> today = statsMapper.selectToday();
        Map<String, Object> tableStat = statsMapper.selectTableStat();

        // 客单价 = 营业额 / 订单数（保留两位小数）
        long orderCount = ((Number) total.getOrDefault("orderCount", 0)).longValue();
        BigDecimal turnover = new BigDecimal(String.valueOf(total.getOrDefault("turnover", BigDecimal.ZERO)));
        BigDecimal avg = orderCount > 0
                ? turnover.divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        total.put("avgOrderAmount", avg);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", total);
        result.put("today", today);
        result.put("tableStat", tableStat);
        return result;
    }

    /** 菜品销量排行 */
    public List<Map<String, Object>> topDishes(Integer limit) {
        int size = (limit == null || limit <= 0) ? 5 : Math.min(limit, 50);
        return statsMapper.selectTopDishes(size);
    }

    /** 分类营业额占比 */
    public List<Map<String, Object>> categoryStats() {
        return statsMapper.selectCategoryStats();
    }
}
