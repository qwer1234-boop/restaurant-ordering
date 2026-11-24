package com.restaurant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 老板端登录请求。
 * 密码由 OwnerAuthService 校验，登录成功后返回短期 token。
 */
@Data
public class OwnerLoginDTO {

    /** 老板密码；课程演示默认 8888，可通过环境变量覆盖。 */
    @NotBlank(message = "请输入老板密码")
    private String password;
}
