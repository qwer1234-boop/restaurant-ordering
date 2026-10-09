// pages/index/index.js 点餐主页
const localData = require('../../data/dishes.js');
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    categories: [],      // 左侧分类列表（来自后端接口）
    dishes: [],          // 全部菜品（来自后端接口）
    currentCategory: 0,  // 当前选中分类
    filteredDishes: [],  // 当前分类下的菜品
    cart: [],            // 购物车
    totalCount: 0,       // 购物车总数量
    totalPrice: 0,       // 购物车总价（元）
    showCart: false,     // 是否展开购物车面板
    dataSource: ''       // 数据来源提示：server 后端 / local 本地兜底
  },

  onLoad() {
    this.loadMenu();
    this.refreshCart();
  },

  onShow() {
    // 从其他页面返回时同步最新购物车状态
    this.refreshCart();
  },

  // 从后端加载分类与菜品；后端未启动时自动降级为本地数据
  loadMenu() {
    const self = this;
    return Promise.all([api.getCategories(), api.getDishes()])
      .then(([categories, dishes]) => {
        // 后端字段 description → 页面用的 desc
        const list = dishes.map(d => ({ ...d, desc: d.description }));
        app.globalData.apiOnline = true;
        self.setData({ categories, dishes: list, dataSource: 'server' });
        self.filterDishes(categories.length ? categories[0].id : 0);
      })
      .catch(err => {
        console.warn('[菜单] 接口调用失败，使用本地数据兜底：', err.message);
        app.globalData.apiOnline = false;
        self.setData({
          categories: localData.categories,
          dishes: localData.dishes,
          dataSource: 'local'
        });
        self.filterDishes(localData.categories[0].id);
        wx.showToast({ title: '已使用本地数据（后端未启动）', icon: 'none', duration: 2500 });
      });
  },

  // 按分类过滤菜品
  filterDishes(categoryId) {
    const filteredDishes = this.data.dishes.filter(d => d.categoryId === categoryId);
    this.setData({ currentCategory: categoryId, filteredDishes });
  },

  // 点击左侧分类
  onCategoryTap(e) {
    this.filterDishes(e.currentTarget.dataset.id);
  },

  // 加购
  onAddTap(e) {
    const dish = this.data.dishes.find(d => d.id === e.currentTarget.dataset.id);
    const cart = app.globalData.cart;
    const item = cart.find(i => i.id === dish.id);
    if (item) {
      item.count += 1;
    } else {
      cart.push({ id: dish.id, name: dish.name, price: dish.price, emoji: dish.emoji, count: 1 });
    }
    this.refreshCart();
  },

  // 购物车内减/移除
  onMinusTap(e) {
    const cart = app.globalData.cart;
    const id = e.currentTarget.dataset.id;
    const index = cart.findIndex(i => i.id === id);
    if (index < 0) return;
    cart[index].count -= 1;
    if (cart[index].count <= 0) cart.splice(index, 1);
    // 购物车空了就自动收起面板
    if (cart.length === 0) this.setData({ showCart: false });
    this.refreshCart();
  },

  // 重新计算数量与总价
  refreshCart() {
    const cart = app.globalData.cart;
    const totalCount = cart.reduce((s, i) => s + i.count, 0);
    const totalPrice = cart.reduce((s, i) => s + i.count * i.price, 0);
    this.setData({ cart, totalCount, totalPrice });
  },

  // 展开 / 收起购物车明细
  onToggleCart() {
    if (this.data.totalCount === 0) return;
    this.setData({ showCart: !this.data.showCart });
  },

  // 清空购物车
  onClearCart() {
    app.globalData.cart = [];
    this.setData({ showCart: false });
    this.refreshCart();
  },

  // 去结算
  onCheckout() {
    if (this.data.totalCount === 0) {
      wx.showToast({ title: '请先选择菜品', icon: 'none' });
      return;
    }
    this.setData({ showCart: false });
    wx.navigateTo({ url: '/pages/confirm/confirm' });
  }
});
