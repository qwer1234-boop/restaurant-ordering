package com.restaurant.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理。
 *
 * 目标：不管 Controller / Service 抛什么异常，前端都收到同一种 Result 结构，
 * 不用在每个接口里写 try-catch。
 *
 * 返回约定：
 * - BizException：业务可预期错误（库存不足、状态非法、密码错误等），返回业务 code；
 * - 参数校验异常：返回 400 + 第一条字段错误；
 * - 其他异常：返回 500 + 通用错误信息，完整堆栈只写日志。
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 业务异常：例如库存不足、桌号不存在、订单状态非法。 */
    @ExceptionHandler(BizException.class)
    public Result<Void> handleBizException(BizException e) {
        log.warn("业务异常：{}", e.getMessage());
        return Result.fail(e.getMessage(), e.getCode());
    }

    /** 参数校验失败：@Valid 校验不通过时，取第一条字段错误提示给前端。 */
    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public Result<Void> handleValidException(Exception e) {
        String message = "参数校验失败";
        if (e instanceof MethodArgumentNotValidException ex && ex.getBindingResult().getFieldError() != null) {
            message = ex.getBindingResult().getFieldError().getDefaultMessage();
        }
        log.warn("参数校验失败：{}", message);
        return Result.fail(message, 400);
    }

    /**
     * 未预期异常：日志里保留完整堆栈，接口只返回可读信息。
     * 课程演示为了排查方便返回了 e.getMessage()；生产环境建议改成通用提示。
     */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.fail("服务器内部错误：" + e.getMessage(), 500);
    }
}
