package com.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 菜品（表 dish）
 */
@Data
public class Dish {

    /** 菜品ID */
    private Integer id;

    /** 所属分类ID */
    private Integer categoryId;

    /** 分类名称（联表查询，非表字段） */
    private String categoryName;

    /** 菜品名称 */
    private String name;

    /** 单价（元），使用 BigDecimal 避免浮点误差 */
    private BigDecimal price;

    /** 菜品图标 */
    private String emoji;

    /** 菜品简介 */
    private String description;

    /** 累计销量 */
    private Integer sales;

    /** 库存份数 */
    private Integer stock;

    /** 状态：1在售 0停售 */
    private Integer status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
