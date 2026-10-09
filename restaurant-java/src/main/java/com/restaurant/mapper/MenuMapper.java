package com.restaurant.mapper;

import com.restaurant.entity.Category;
import com.restaurant.entity.Dish;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 菜单相关数据访问（分类 + 菜品）
 */
public interface MenuMapper {

    /** 查询全部分类，并统计各分类下在售菜品数量 */
    List<Category> selectCategories();

    /** 按分类 / 名称关键字查询在售菜品 */
    List<Dish> selectDishes(@Param("categoryId") Integer categoryId,
                            @Param("keyword") String keyword);

    /** 查询单个菜品 */
    Dish selectDishById(@Param("id") Integer id);

    /** 下单成功后：增加销量、扣减库存 */
    int addSalesAndDecreaseStock(@Param("dishId") Integer dishId,
                                 @Param("count") Integer count);

    /** 取消订单时：回退销量与库存 */
    int rollbackSalesAndStock(@Param("dishId") Integer dishId,
                              @Param("count") Integer count);
}
