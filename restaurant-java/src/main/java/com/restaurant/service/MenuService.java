package com.restaurant.service;

import com.restaurant.entity.Category;
import com.restaurant.entity.Dish;
import com.restaurant.mapper.MenuMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 菜单业务：分类、菜品查询
 */
@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuMapper menuMapper;

    /** 查询全部分类（含各分类菜品数量） */
    public List<Category> listCategories() {
        return menuMapper.selectCategories();
    }

    /** 查询菜品列表，支持分类过滤与名称搜索 */
    public List<Dish> listDishes(Integer categoryId, String keyword) {
        return menuMapper.selectDishes(categoryId, keyword);
    }

    /** 查询菜品详情，不存在时抛出业务异常 */
    public Dish getDish(Integer id) {
        Dish dish = menuMapper.selectDishById(id);
        if (dish == null) {
            throw new com.restaurant.common.BizException("菜品不存在", 404);
        }
        return dish;
    }
}
