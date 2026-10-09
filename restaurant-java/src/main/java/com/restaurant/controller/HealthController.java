package com.restaurant.controller;

import com.restaurant.common.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 健康检查接口：确认服务与数据库连接是否正常
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @GetMapping("/health")
    public Result<Map<String, Object>> health() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("service", "restaurant-java (Spring Boot 3 + MyBatis + MySQL)");
        data.put("datasource", datasourceUrl.split("\\?")[0]);
        data.put("time", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        return Result.ok(data);
    }
}
