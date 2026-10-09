package com.restaurant;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 模拟餐厅点餐系统 · Java 后端启动类
 *
 * 启动后访问 http://localhost:8080/api/health 可做健康检查
 */
@SpringBootApplication
@MapperScan("com.restaurant.mapper")
public class RestaurantApplication {

    public static void main(String[] args) {
        SpringApplication.run(RestaurantApplication.class, args);
        System.out.println("""

                ==================================================
                  模拟餐厅点餐系统 · Java 后端启动成功
                  接口地址：http://localhost:8080/api
                  健康检查：http://localhost:8080/api/health
                ==================================================
                """);
    }
}
