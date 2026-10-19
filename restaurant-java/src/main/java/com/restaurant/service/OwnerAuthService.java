package com.restaurant.service;

import com.restaurant.common.BizException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 老板端登录会话：课程作业使用内存令牌，重启后失效。
 */
@Service
public class OwnerAuthService {

    @Value("${app.owner.password:8888}")
    private String ownerPassword;

    @Value("${app.owner.token-hours:8}")
    private long tokenHours;

    private final Map<String, Instant> sessions = new ConcurrentHashMap<>();

    public Map<String, Object> login(String password) {
        if (password == null || !ownerPassword.equals(password.trim())) {
            throw new BizException("老板密码错误", 401);
        }
        String token = UUID.randomUUID().toString().replace("-", "");
        sessions.put(token, Instant.now().plus(tokenHours, ChronoUnit.HOURS));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("token", token);
        data.put("expiresIn", tokenHours * 3600);
        return data;
    }

    public boolean isValid(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        Instant expireAt = sessions.get(token);
        if (expireAt == null) {
            return false;
        }
        if (expireAt.isBefore(Instant.now())) {
            sessions.remove(token);
            return false;
        }
        return true;
    }
}
