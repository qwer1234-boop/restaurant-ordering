package com.restaurant.service;

import com.restaurant.entity.DiningTable;
import com.restaurant.mapper.TableMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 餐桌业务：查询餐桌及占用状态
 */
@Service
@RequiredArgsConstructor
public class TableService {

    private final TableMapper tableMapper;

    public List<DiningTable> listAll() {
        return tableMapper.selectAll();
    }
}
