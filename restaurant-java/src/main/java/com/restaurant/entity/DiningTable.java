package com.restaurant.entity;

import lombok.Data;

/**
 * 餐桌（表 dining_table）
 */
@Data
public class DiningTable {

    /** 餐桌ID */
    private Integer id;

    /** 桌号，如 A01 */
    private String tableNo;

    /** 座位数 */
    private Integer seats;

    /** 状态：0空闲 1使用中 */
    private Integer status;
}
