package com.restaurant.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurant.common.Result;
import com.restaurant.service.OwnerAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

/**
 * 老板端接口鉴权：除登录外，/api/owner/** 都需要 X-Owner-Token。
 */
@Component
@RequiredArgsConstructor
public class OwnerAuthInterceptor implements HandlerInterceptor {

    private final OwnerAuthService ownerAuthService;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        if (ownerAuthService.isValid(request.getHeader("X-Owner-Token"))) {
            return true;
        }
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        objectMapper.writeValue(response.getWriter(), Result.fail("未登录或登录已过期", 401));
        return false;
    }
}
