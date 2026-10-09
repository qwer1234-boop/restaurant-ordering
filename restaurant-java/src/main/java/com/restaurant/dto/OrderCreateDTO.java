package com.restaurant.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 下单请求参数
 * 对应小程序 { tableNo, remark, items: [{ dishId, count }] }
 */
@Data
public class OrderCreateDTO {

    @NotBlank(message = "缺少桌号 tableNo")
    private String tableNo;

    /** 备注（选填） */
    private String remark = "";

    @NotEmpty(message = "购物车为空，无法下单")
    @Valid
    private List<Item> items;

    @Data
    public static class Item {

        @NotNull(message = "菜品参数不合法")
        private Integer dishId;

        @NotNull(message = "菜品数量不合法")
        @Min(value = 1, message = "菜品数量必须大于 0")
        private Integer count;
    }
}
