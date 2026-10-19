package com.restaurant.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 老板端新增/编辑菜品请求
 */
@Data
public class DishSaveDTO {

    @NotNull(message = "请选择菜品分类")
    private Integer categoryId;

    @NotBlank(message = "请输入菜品名称")
    @Size(max = 64, message = "菜品名称不能超过 64 个字符")
    private String name;

    @NotNull(message = "请输入菜品价格")
    @DecimalMin(value = "0.01", message = "菜品价格必须大于 0")
    private BigDecimal price;

    @Size(max = 16, message = "菜品图标不能超过 16 个字符")
    private String emoji = "";

    @Size(max = 255, message = "菜品简介不能超过 255 个字符")
    private String description = "";

    @NotNull(message = "请输入库存")
    @Min(value = 0, message = "库存不能为负数")
    private Integer stock;

    /** 1 在售，0 停售；新增时默认在售 */
    private Integer status = 1;
}
