package com.restaurant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 老板端登录请求
 */
@Data
public class OwnerLoginDTO {

    @NotBlank(message = "请输入老板密码")
    private String password;
}
