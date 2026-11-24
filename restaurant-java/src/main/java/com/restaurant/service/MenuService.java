package com.restaurant.service;

import com.restaurant.common.BizException;
import com.restaurant.dto.DishSaveDTO;
import com.restaurant.entity.Category;
import com.restaurant.entity.Dish;
import com.restaurant.mapper.MenuMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 菜单业务：分类、菜品查询，以及老板端菜品维护。
 *
 * 顾客端只查在售菜品；老板端可以查全部（含停售），
 * 上下架采用软下架，历史订单仍保留菜品快照。
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
            throw new BizException("菜品不存在", 404);
        }
        return dish;
    }

    /** 老板端：全部菜品（含停售） */
    public List<Dish> listAllDishes() {
        return menuMapper.selectAllDishes();
    }

    /**
     * 老板端：新增菜品。
     * 先校验分类存在，再把 DTO 内容拷到实体；销量固定从 0 开始。
     */
    @Transactional(rollbackFor = Exception.class)
    public Dish createDish(DishSaveDTO dto) {
        validateCategory(dto.getCategoryId());
        Dish dish = new Dish();
        apply(dish, dto);
        dish.setStatus(dto.getStatus() == null ? 1 : dto.getStatus());
        menuMapper.insertDish(dish);
        return getDish(dish.getId());
    }

    /**
     * 老板端：编辑菜品。
     * 只允许改基础信息；销量不在 DTO 里，避免手动改销量破坏统计。
     */
    @Transactional(rollbackFor = Exception.class)
    public Dish updateDish(Integer id, DishSaveDTO dto) {
        Dish existing = getDish(id);
        validateCategory(dto.getCategoryId());
        Dish dish = new Dish();
        dish.setId(id);
        apply(dish, dto);
        dish.setStatus(dto.getStatus() == null ? existing.getStatus() : dto.getStatus());
        menuMapper.updateDish(dish);
        return getDish(id);
    }

    /**
     * 老板端：上架 / 停售。
     * status 只允许 0（停售）或 1（在售）；停售不删除菜品，历史订单不受影响。
     */
    @Transactional(rollbackFor = Exception.class)
    public Dish updateDishStatus(Integer id, Integer status) {
        if (status == null || (status != 0 && status != 1)) {
            throw new BizException("菜品状态只能是 0（停售）或 1（在售）");
        }
        getDish(id);
        menuMapper.updateDishStatus(id, status);
        return getDish(id);
    }

    /** 分类必须存在，否则新增/编辑菜品会变成“孤立数据”。 */
    private void validateCategory(Integer categoryId) {
        if (categoryId == null || menuMapper.selectCategoryById(categoryId) == null) {
            throw new BizException("菜品分类不存在");
        }
    }

    /** 把 DTO 的可编辑字段拷到实体；销量、创建时间等字段不在这里改。 */
    private void apply(Dish dish, DishSaveDTO dto) {
        dish.setCategoryId(dto.getCategoryId());
        dish.setName(dto.getName().trim());
        dish.setPrice(dto.getPrice());
        dish.setEmoji(dto.getEmoji() == null ? "" : dto.getEmoji().trim());
        dish.setDescription(dto.getDescription() == null ? "" : dto.getDescription().trim());
        dish.setStock(dto.getStock());
    }
}
