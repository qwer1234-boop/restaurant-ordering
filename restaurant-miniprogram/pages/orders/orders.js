// pages/orders/orders.js 历史订单页
const api = require('../../utils/api.js');
const app = getApp();

// 订单状态 → 标签样式类 / 进度步数 / 是否已取消
function decorateOrder(o) {
  const status = o.status || '';
  let statusType = 'pending';
  let step = 0;
  let cancelled = false;
  if (status.indexOf('制作中') > -1) { statusType = 'cooking'; step = 1; }
  else if (status.indexOf('已完成') > -1) { statusType = 'done'; step = 2; }
  else if (status.indexOf('已取消') > -1) { statusType = 'cancel'; cancelled = true; }
  else if (status.indexOf('本地') > -1) { statusType = 'local'; }
  return { ...o, statusType, step, cancelled };
}

Page({
  data: {
    orders: [],
    loading: true,
    dataSource: ''   // server 后端 / local 本地兜底
  },

  onShow() {
    this.loadOrders();
  },

  // 优先从后端数据库读取订单，失败则展示本地缓存订单
  loadOrders() {
    const localOrders = (app.globalData.orders || [])
      .filter(o => !o.fromServer)
      .map(o => decorateOrder(o));

    api.getOrders(50)
      .then(list => {
        // 后端订单结构 → 页面展示结构
        const serverOrders = list.map(o => decorateOrder({
          id: o.orderNo,
          tableNo: o.tableNo,
          note: o.remark,
          // 保留原有的展开状态，避免刷新后收起
          expanded: this.isExpanded(o.orderNo),
          items: o.items.map(i => ({ id: i.dishId, name: i.name, emoji: i.emoji, price: i.price, count: i.count })),
          total: o.totalAmount,
          status: o.status,
          time: o.createdAt,
          fromServer: true
        }));

        app.globalData.orders = serverOrders.concat(localOrders);
        this.setData({ orders: app.globalData.orders, loading: false, dataSource: 'server' });
      })
      .catch(err => {
        console.warn('[订单] 接口调用失败，展示本地订单：', err.message);
        this.setData({ orders: app.globalData.orders, loading: false, dataSource: 'local' });
      });
  },

  isExpanded(orderNo) {
    const cur = this.data.orders.find(o => o.id === orderNo);
    return cur ? !!cur.expanded : false;
  },

  // 查看订单明细（展开/收起）
  onToggle(e) {
    const index = e.currentTarget.dataset.index;
    const key = `orders[${index}].expanded`;
    this.setData({ [key]: !this.data.orders[index].expanded });
  },

  // 空状态：去点餐
  onGoMenu() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrders();
    wx.stopPullDownRefresh();
  }
});
