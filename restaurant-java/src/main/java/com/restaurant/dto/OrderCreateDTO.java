package com.restaurant.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 下单请求参数。
 * 对应小程序提交的 { tableNo, remark, items: [{ dishId, count }] }。
 *
 * 注意：这里不接收价格，订单金额由后端按数据库菜品单价计算，
 * 防止前端篡改金额。
 */
@Data
public class OrderCreateDTO {

    /** 桌号，必须对应 dining_table 中的记录。 */
    @NotBlank(message = "缺少桌号 tableNo")
    private String tableNo;

    /** 顾客备注（选填），最长由数据库字段限制。 */
    private String remark = "";

    /** 购物车明细，至少一项；嵌套项也会触发 @Valid 校验。 */
    @NotEmpty(message = "购物车为空，无法下单")
    @Valid
    private List<Item> items;

    /** 单条购物车项：只传菜品 ID 和数量，不传价格。 */
    @Data
    public static class Item {

        /** 菜品 ID，必须是存在且在售的菜品。 */
        @NotNull(message = "菜品参数不合法")
        private Integer dishId;

        /** 数量，至少 1 份。 */
        @NotNull(message = "菜品数量不合法")
        @Min(value = 1, message = "菜品数量必须大于 0")
        private Integer count;
    }
}
