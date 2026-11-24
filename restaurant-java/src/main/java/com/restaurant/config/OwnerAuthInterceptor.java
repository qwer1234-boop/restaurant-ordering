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
 * 老板端接口鉴权。
 *
 * /api/owner/** 除登录外都要带 X-Owner-Token；
 * 校验失败直接返回 401 + 统一 Result，前端据此跳回登录页。
 */
@Component
@RequiredArgsConstructor
public class OwnerAuthInterceptor implements HandlerInterceptor {

    private final OwnerAuthService ownerAuthService;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        // 浏览器跨域预检请求不带 token，直接放行，交给 CORS 配置处理。
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        // token 存在且未过期才放行；否则统一返回 401。
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
