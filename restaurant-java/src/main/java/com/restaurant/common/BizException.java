package com.restaurant.common;

import lombok.Getter;

/**
 * 业务异常：用于库存不足、桌号不存在等可预期的错误。
 * 抛出后由 GlobalExceptionHandler 统一转换为 Result.fail 返回，并回滚事务。
 */
@Getter
public class BizException extends RuntimeException {

    private final Integer code;

    public BizException(String message) {
        this(message, 400);
    }

    public BizException(String message, Integer code) {
        super(message);
        this.code = code;
    }
}
