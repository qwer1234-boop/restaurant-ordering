package com.restaurant.controller;

import com.restaurant.common.Result;
import com.restaurant.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 顾客端（公开）统计接口，老板端另有 /api/owner/stats 汇总接口。
 *
 *   GET /api/stats/summary   经营概况
 *   GET /api/stats/top       菜品销量排行
 *   GET /api/stats/category  分类营业额占比
 */
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    /** 经营概况：累计/今日订单、营业额、客单价、餐桌占用。 */
    @GetMapping("/summary")
    public Result<Map<String, Object>> summary() {
        return Result.ok(statsService.summary());
    }

    /** 热销榜：limit 由 Service 限制在 1–50，默认 5。 */
    @GetMapping("/top")
    public Result<List<Map<String, Object>>> top(@RequestParam(required = false) Integer limit) {
        return Result.ok(statsService.topDishes(limit));
    }

    /** 分类营业额占比，前端画条形图。 */
    @GetMapping("/category")
    public Result<List<Map<String, Object>>> category() {
        return Result.ok(statsService.categoryStats());
    }
}
