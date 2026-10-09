package com.restaurant.controller;

import com.restaurant.common.Result;
import com.restaurant.entity.Category;
import com.restaurant.entity.DiningTable;
import com.restaurant.entity.Dish;
import com.restaurant.service.MenuService;
import com.restaurant.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 菜单与餐桌接口
 *   GET /api/categories
 *   GET /api/dishes?categoryId=&keyword=
 *   GET /api/dishes/{id}
 *   GET /api/tables
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;
    private final TableService tableService;

    /** 分类列表 */
    @GetMapping("/categories")
    public Result<List<Category>> categories() {
        return Result.ok(menuService.listCategories());
    }

    /** 菜品列表（支持分类过滤与名称搜索） */
    @GetMapping("/dishes")
    public Result<List<Dish>> dishes(@RequestParam(required = false) Integer categoryId,
                                     @RequestParam(required = false) String keyword) {
        return Result.ok(menuService.listDishes(categoryId, keyword));
    }

    /** 菜品详情 */
    @GetMapping("/dishes/{id}")
    public Result<Dish> dishDetail(@PathVariable Integer id) {
        return Result.ok(menuService.getDish(id));
    }

    /** 餐桌列表 */
    @GetMapping("/tables")
    public Result<List<DiningTable>> tables() {
        return Result.ok(tableService.listAll());
    }
}
