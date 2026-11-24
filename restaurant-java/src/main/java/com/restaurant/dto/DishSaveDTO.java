package com.restaurant.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 老板端新增 / 编辑菜品请求。
 *
 * 这些字段直接对应小程序菜品编辑表单；校验失败会被全局异常处理器
 * 转成 400 + 第一条字段错误，前端直接 toast 给老板看。
 */
@Data
public class DishSaveDTO {

    /** 所属分类 ID，必须是 category 表里已存在的分类。 */
    @NotNull(message = "请选择菜品分类")
    private Integer categoryId;

    /** 菜品名称；新增和编辑都必填，最长 64 字符。 */
    @NotBlank(message = "请输入菜品名称")
    @Size(max = 64, message = "菜品名称不能超过 64 个字符")
    private String name;

    /** 单价（元），必须大于 0；数据库用 DECIMAL(10,2) 保存。 */
    @NotNull(message = "请输入菜品价格")
    @DecimalMin(value = "0.01", message = "菜品价格必须大于 0")
    private BigDecimal price;

    /** 菜品图标，课程项目里用 emoji 或本地图片映射，最长 16 字符。 */
    @Size(max = 16, message = "菜品图标不能超过 16 个字符")
    private String emoji = "";

    /** 菜品简介（选填），最长 255 字符。 */
    @Size(max = 255, message = "菜品简介不能超过 255 个字符")
    private String description = "";

    /** 库存份数，不能为负数；下单扣减、取消回滚。 */
    @NotNull(message = "请输入库存")
    @Min(value = 0, message = "库存不能为负数")
    private Integer stock;

    /** 1 在售，0 停售；新增时默认在售。 */
    private Integer status = 1;
}
