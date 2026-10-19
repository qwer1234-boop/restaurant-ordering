// pages/index/index.js 点餐主页
const localData = require('../../data/dishes.js');
const api = require('../../utils/api.js');
const dishImages = require('../../utils/dishImages.js');
const app = getApp();

Page({
  data: {
    categories: [],      // 左侧分类列表（来自后端接口）
    dishes: [],          // 全部菜品（已附加 hot / soldOut 展示标记）
    currentCategory: 0,  // 当前选中分类
    filteredDishes: [],  // 当前分类下的菜品
    cart: [],            // 购物车
    cartMap: {},         // 菜品ID → 购物车数量（驱动步进器显示）
    totalCount: 0,       // 购物车总数量
    totalPrice: 0,       // 购物车总价（元）
    showCart: false,     // 是否展开购物车面板
    dataSource: '',      // 数据来源提示：server 后端 / local 本地兜底
    loading: true,       // 骨架屏开关
    searchKey: '',       // 搜索关键词
    searchResults: [],   // 搜索结果（跨分类）
    fly: { visible: false, x: 0, y: 0, opacity: 1 },  // 加购抛物线小球
    badgeBump: false     // 购物车徽标弹跳动画
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
        app.globalData.apiOnline = true;
        self.setData({ categories, dishes: self.decorateDishes(dishes), dataSource: 'server', loading: false });
        self.filterDishes(categories.length ? categories[0].id : 0);
      })
      .catch(err => {
        console.warn('[菜单] 接口调用失败，使用本地数据兜底：', err.message);
        app.globalData.apiOnline = false;
        self.setData({
          categories: localData.categories,
          dishes: self.decorateDishes(localData.dishes),
          dataSource: 'local',
          loading: false
        });
        self.filterDishes(localData.categories[0].id);
        wx.showToast({ title: '已使用本地数据（后端未启动）', icon: 'none', duration: 2500 });
      });
  },

  // 图片加载失败回退默认图（防止删除/改错图片后显示空白）
  onImgError(e) {
    const id = e.currentTarget.dataset.id;
    const def = dishImages.DEFAULT_IMAGE;
    const dishes = this.data.dishes.map(d => d.id === id ? { ...d, image: def } : d);
    this.setData({ dishes });
  },

  // 附加展示标记：desc 字段映射、热销标签（销量前3）、售罄标记
  decorateDishes(dishes) {
    const top3 = [...dishes]
      .sort((a, b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, 3)
      .map(d => d.id);
    return dishes.map(d => ({
      ...d,
      desc: d.description !== undefined ? d.description : d.desc,
      image: dishImages.imageFor(d.name),   // 菜品本地图片（按名称匹配，缺省回退 default.jpg）
      hot: (d.sales || 0) > 0 && top3.indexOf(d.id) > -1,
      soldOut: typeof d.stock === 'number' && d.stock <= 0
    }));
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

  // 搜索：跨分类模糊匹配名称/简介
  onSearchInput(e) {
    const searchKey = e.detail.value.trim();
    const searchResults = searchKey
      ? this.data.dishes.filter(d =>
          (d.name && d.name.indexOf(searchKey) > -1) ||
          (d.desc && d.desc.indexOf(searchKey) > -1))
      : [];
    this.setData({ searchKey, searchResults });
  },

  onClearSearch() {
    this.setData({ searchKey: '', searchResults: [] });
  },

  // 加购：库存校验 → 抛物线动画 → 更新购物车
  onAddTap(e) {
    const id = e.currentTarget.dataset.id;
    const dish = this.data.dishes.find(d => d.id === id);
    if (!dish) return;

    // 库存校验：购物车中数量已达库存上限则拒绝
    const inCart = this.data.cartMap[id] || 0;
    if (typeof dish.stock === 'number' && inCart >= dish.stock) {
      wx.showToast({ title: '库存不足', icon: 'none' });
      return;
    }

    // 播放飞入购物车动画，结束后徽标弹跳
    this.flyToCart(id);

    const cart = app.globalData.cart;
    const item = cart.find(i => i.id === id);
    if (item) {
      item.count += 1;
    } else {
      cart.push({ id: dish.id, name: dish.name, price: dish.price, emoji: dish.emoji, image: dish.image, count: 1 });
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

  // 重新计算数量、总价与 cartMap（菜品ID → 数量）
  refreshCart() {
    const cart = app.globalData.cart;
    const totalCount = cart.reduce((s, i) => s + i.count, 0);
    const totalPrice = Math.round(cart.reduce((s, i) => s + i.count * i.price, 0) * 100) / 100;
    const cartMap = {};
    cart.forEach(i => { cartMap[i.id] = i.count; });
    this.setData({ cart, totalCount, totalPrice, cartMap });
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

  // 老板入口：已登录直接进看板，否则去登录页
  onOwnerTap() {
    const app = getApp();
    const url = app.globalData.isOwner ? '/pages/owner/owner' : '/pages/owner-login/owner-login';
    wx.navigateTo({ url });
  },

  // 去结算
  onCheckout() {
    if (this.data.totalCount === 0) {
      wx.showToast({ title: '请先选择菜品', icon: 'none' });
      return;
    }
    this.setData({ showCart: false });
    wx.navigateTo({ url: '/pages/confirm/confirm' });
  },

  /**
   * 加购抛物线动画：小球从加号按钮飞入购物车图标
   * 方案参考掘金踩坑文：小程序无 rAF、wx:if 动态插入节点真机不触发 transition，
   * 故采用「常驻节点 + setTimeout 逐帧插值 + easeOutCubic 贝塞尔」，真机/工具均稳定。
   */
  flyToCart(dishId) {
    const self = this;
    const sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();

    const fromQuery = wx.createSelectorQuery();
    fromQuery.select('#dish-add-' + dishId).boundingClientRect();
    fromQuery.select('#cartIcon').boundingClientRect();
    fromQuery.exec(res => {
      const from = res[0];
      const target = res[1];
      // 起点按钮不在当前可视列表（如从购物车面板加购）→ 跳过抛物线，徽标直接弹跳
      if (!from || !target) {
        self.setData({ badgeBump: true });
        setTimeout(() => self.setData({ badgeBump: false }), 300);
        return;
      }

      const sx = from.left + from.width / 2;
      const sy = from.top + from.height / 2;
      const tx = target.left + target.width / 2;
      const ty = target.top + target.height / 2;

      // 二次贝塞尔控制点：中点上方，形成抛物线
      const cx = (sx + tx) / 2;
      const cy = Math.min(sy, ty) - sys.windowHeight * 0.12;

      const duration = 550;
      const start = Date.now();
      self.setData({ 'fly.visible': true, 'fly.x': sx, 'fly.y': sy, 'fly.opacity': 1 });

      const step = () => {
        const t = Math.min((Date.now() - start) / duration, 1);
        const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * cx + e * e * tx;
        const y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * cy + e * e * ty;
        // 最后 15% 行程淡出
        const opacity = t > 0.85 ? Math.max(0, (1 - t) / 0.15) : 1;
        self.setData({ 'fly.x': x, 'fly.y': y, 'fly.opacity': opacity });
        if (t < 1) {
          setTimeout(step, 16);
        } else {
          // 落点：隐藏小球，徽标弹跳
          self.setData({ 'fly.visible': false, badgeBump: true });
          setTimeout(() => self.setData({ badgeBump: false }), 300);
        }
      };
      setTimeout(step, 16);
    });
  }
});
