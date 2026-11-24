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
 * 老板端登录会话。
 *
 * 课程演示采用最简单的内存会话：
 * - 登录成功生成随机 token，存进 ConcurrentHashMap；
 * - token 默认 8 小时过期，重启服务后全部失效；
 * - 没有引入 JWT / Redis，目的是让代码短、现场好讲。
 *
 * 生产环境应改为：密码哈希存储、JWT 或服务端会话、多实例共享存储。
 */
@Service
public class OwnerAuthService {

    @Value("${app.owner.password:8888}")
    private String ownerPassword;

    @Value("${app.owner.token-hours:8}")
    private long tokenHours;

    /** token -> 过期时间；ConcurrentHashMap 保证多请求下读写安全。 */
    private final Map<String, Instant> sessions = new ConcurrentHashMap<>();

    /**
     * 校验老板密码，成功则签发新 token。
     *
     * @param password 前端提交的老板密码
     * @return token 和过期秒数，供前端保存
     */
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

    /**
     * 校验 token 是否存在且未过期。
     * 过期的 token 顺手删掉，避免 Map 越积越多。
     */
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
