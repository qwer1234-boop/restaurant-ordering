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
 * 健康检查接口。
 *
 * 返回服务名、数据源地址和当前时间，用于确认 Spring Boot 已启动、配置已加载。
 * 注意：它没有真正执行 SELECT，不能单独证明数据库一定可连；
 * 现场演示时建议再访问一个真实查询接口（如 /api/categories）。
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    /** 返回服务状态和数据源配置（不返回密码）。 */
    @GetMapping("/health")
    public Result<Map<String, Object>> health() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("service", "restaurant-java (Spring Boot 3 + MyBatis + MySQL)");
        // 只暴露地址，不暴露用户名/密码；去掉 URL 里的参数部分。
        data.put("datasource", datasourceUrl.split("\\?")[0]);
        data.put("time", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        return Result.ok(data);
    }
}
