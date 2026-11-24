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
 * 顾客端菜单与餐桌接口。
 *
 * 这些接口只返回顾客可见数据：在售菜品、分类、餐桌；
 * 老板端的全部菜品（含停售）走 /api/owner/dishes。
 *
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

    /** 分类列表：附带每个分类下的在售菜品数量。 */
    @GetMapping("/categories")
    public Result<List<Category>> categories() {
        return Result.ok(menuService.listCategories());
    }

    /** 菜品列表：categoryId 可选，keyword 按名称模糊搜索。 */
    @GetMapping("/dishes")
    public Result<List<Dish>> dishes(@RequestParam(required = false) Integer categoryId,
                                     @RequestParam(required = false) String keyword) {
        return Result.ok(menuService.listDishes(categoryId, keyword));
    }

    /** 菜品详情：不存在时由 Service 抛 404 业务异常。 */
    @GetMapping("/dishes/{id}")
    public Result<Dish> dishDetail(@PathVariable Integer id) {
        return Result.ok(menuService.getDish(id));
    }

    /** 餐桌列表：确认页选桌号时使用。 */
    @GetMapping("/tables")
    public Result<List<DiningTable>> tables() {
        return Result.ok(tableService.listAll());
    }
}
