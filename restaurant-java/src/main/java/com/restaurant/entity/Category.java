package com.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 菜品分类（表 category）
 */
@Data
public class Category {

    /** 分类ID */
    private Integer id;

    /** 分类名称 */
    private String name;

    /** 排序号，越小越靠前 */
    private Integer sortOrder;

    /** 该分类下在售菜品数量（联表统计，非表字段） */
    private Integer dishCount;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
