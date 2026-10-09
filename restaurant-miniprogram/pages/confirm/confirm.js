// pages/confirm/confirm.js 订单确认页
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    cart: [],
    totalCount: 0,
    totalPrice: 0,
    tableNo: '',        // 桌号
    note: '',           // 备注
    tables: [],         // 可选的餐桌列表（来自后端 /api/tables）
    submitting: false
  },

  onShow() {
    // 购物车为空时不允许进入本页
    if (app.globalData.cart.length === 0) {
      wx.navigateBack();
      return;
    }
    this.refresh();
    this.loadTables();
  },

  // 加载餐桌列表，失败则忽略（仍可手动输入桌号）
  loadTables() {
    api.getTables()
      .then(tables => this.setData({ tables }))
      .catch(() => this.setData({ tables: [] }));
  },

  // 点选餐桌
  onTableSelect(e) {
    this.setData({ tableNo: e.currentTarget.dataset.no });
  },

  refresh() {
    const cart = app.globalData.cart;
    this.setData({
      cart,
      totalCount: cart.reduce((s, i) => s + i.count, 0),
      totalPrice: cart.reduce((s, i) => s + i.count * i.price, 0)
    });
  },

  onTableInput(e) {
    this.setData({ tableNo: e.detail.value });
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value });
  },

  // 减少数量
  onMinusTap(e) {
    const cart = app.globalData.cart;
    const id = e.currentTarget.dataset.id;
    const index = cart.findIndex(i => i.id === id);
    if (index < 0) return;
    cart[index].count -= 1;
    if (cart[index].count <= 0) cart.splice(index, 1);
    if (cart.length === 0) {
      wx.navigateBack();
      return;
    }
    this.refresh();
  },

  // 提交订单：优先写入后端数据库，后端不可用时降级为本地保存
  onSubmit() {
    const { tableNo, submitting } = this.data;
    if (submitting) return;
    if (!tableNo) {
      wx.showToast({ title: '请填写桌号', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    const payload = {
      tableNo,
      remark: this.data.note,
      items: app.globalData.cart.map(i => ({ dishId: i.id, count: i.count }))
    };

    api.createOrder(payload)
      .then(order => {
        // 后端返回的订单结构 → 页面展示结构
        const mapped = {
          id: order.orderNo,
          tableNo: order.tableNo,
          note: order.remark,
          items: order.items.map(i => ({ id: i.dishId, name: i.name, emoji: i.emoji, price: i.price, count: i.count })),
          total: order.totalAmount,
          status: order.status,
          time: order.createdAt,
          fromServer: true
        };
        this.saveOrder(mapped);
        wx.showToast({ title: '已写入数据库', icon: 'success' });
        setTimeout(() => wx.switchTab({ url: '/pages/orders/orders' }), 800);
      })
      .catch(err => {
        this.setData({ submitting: false });

        // 网络不通 → 降级为本地订单，保证无后端时也能演示
        if (err.message.indexOf('无法连接后端服务') > -1) {
          this.saveOrder({
            id: 'LOCAL' + Date.now(),
            tableNo,
            note: this.data.note,
            items: app.globalData.cart.map(i => ({ ...i })),
            total: this.data.totalPrice,
            status: '待处理（本地）',
            time: this.formatTime(new Date()),
            fromServer: false
          });
          wx.showToast({ title: '后端未启动，已存本地', icon: 'none', duration: 2000 });
          setTimeout(() => wx.switchTab({ url: '/pages/orders/orders' }), 1200);
          return;
        }

        // 业务错误（库存不足、桌号不存在等）直接提示
        wx.showModal({ title: '下单失败', content: err.message, showCancel: false });
      });
  },

  // 保存订单到全局状态 + 本地缓存
  saveOrder(order) {
    app.globalData.orders.unshift(order);
    wx.setStorageSync('orders', app.globalData.orders);
    app.globalData.cart = [];
    this.setData({ submitting: false });
  },

  // 格式化时间：yyyy-MM-dd HH:mm
  formatTime(d) {
    const p = n => (n < 10 ? '0' + n : '' + n);
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
});
