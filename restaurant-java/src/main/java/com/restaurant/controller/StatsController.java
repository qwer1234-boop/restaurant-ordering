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
 * 统计报表接口
 *   GET /api/stats/summary   经营概况
 *   GET /api/stats/top       菜品销量排行
 *   GET /api/stats/category  分类营业额占比
 */
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/summary")
    public Result<Map<String, Object>> summary() {
        return Result.ok(statsService.summary());
    }

    @GetMapping("/top")
    public Result<List<Map<String, Object>>> top(@RequestParam(required = false) Integer limit) {
        return Result.ok(statsService.topDishes(limit));
    }

    @GetMapping("/category")
    public Result<List<Map<String, Object>>> category() {
        return Result.ok(statsService.categoryStats());
    }
}
