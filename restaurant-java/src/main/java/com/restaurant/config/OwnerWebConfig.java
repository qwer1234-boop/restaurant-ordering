package com.restaurant.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 注册老板端鉴权拦截器。
 */
@Configuration
@RequiredArgsConstructor
public class OwnerWebConfig implements WebMvcConfigurer {

    private final OwnerAuthInterceptor ownerAuthInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(ownerAuthInterceptor)
                .addPathPatterns("/api/owner/**")
                .excludePathPatterns("/api/owner/login");
    }
}
