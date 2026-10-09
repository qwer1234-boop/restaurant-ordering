package com.restaurant.common;

import lombok.Data;

/**
 * 统一响应结果
 * 所有接口返回 { code, message, data }，code = 0 表示成功
 */
@Data
public class Result<T> {

    /** 状态码：0 成功，其余为业务/系统错误 */
    private Integer code;

    /** 提示信息 */
    private String message;

    /** 业务数据 */
    private T data;

    private Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> Result<T> ok(T data) {
        return new Result<>(0, "ok", data);
    }

    public static <T> Result<T> ok(T data, String message) {
        return new Result<>(0, message, data);
    }

    public static <T> Result<T> fail(String message) {
        return new Result<>(500, message, null);
    }

    public static <T> Result<T> fail(String message, Integer code) {
        return new Result<>(code, message, null);
    }
}
