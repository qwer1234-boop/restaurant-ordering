// pages/owner/owner.js 老板端订单看板
// 功能：查看订单（按状态筛选）、接单/出餐/完成、经营统计（营业额 + 热销榜）
const api = require('../../utils/api.js');
const app = getApp();

// 状态标签：后端状态中文 → 样式类 / 步数 / 动作文案
const STATUS_META = {
  '待接单': { type: 'pending', step: 0, action: '接单', next: '制作中' },
  '制作中': { type: 'cooking', step: 1, action: '出餐', next: '已完成' },
  '已完成': { type: 'done', step: 2, action: '', next: '' },
  '已取消': { type: 'cancel', step: -1, action: '', next: '' }
};

function decorate(o) {
  const status = o.status || '待接单';
  const meta = STATUS_META[status] || { type: 'pending', step: 0, action: '接单', next: '制作中' };
  return { ...o, statusType: meta.type, step: meta.step, actionText: meta.action, nextStatus: meta.next };
}

Page({
  data: {
    orders: [],           // 全部订单
    filtered: [],         // 当前筛选后的订单
    activeTab: 'all',     // 当前筛选 tab：all / pending / cooking / done
    loading: true,
    dataSource: '',       // server / local
    // 经营统计
    summary: null,        // { todayOrders, todayRevenue, ... }
    topDishes: [],        // 热销榜
    isOwner: false
  },

  onLoad() {
    if (!app.globalData.isOwner) {
      // 未通过密码校验则退回登录页
      wx.reLaunch({ url: '/pages/owner-login/owner-login' });
      return;
    }
    this.setData({ isOwner: true });
    this.loadAll();
  },

  onShow() {
    if (this.data.isOwner) this.loadAll();
  },

  // 拉取订单 + 统计
  loadAll() {
    this.loadOrders();
    this.loadStats();
  },

  loadOrders() {
    api.getOrders(100)
      .then(list => {
        const orders = list.map(o => decorate({
          id: o.orderNo,
          tableNo: o.tableNo,
          note: o.remark,
          items: (o.items || []).map(i => ({ name: i.name, count: i.count, price: i.price })),
          total: o.totalAmount,
          status: o.status,
          time: o.createdAt
        }));
        this.setData({ orders, loading: false, dataSource: 'server' });
        this.applyFilter();
      })
      .catch(err => {
        console.warn('[老板端] 订单接口失败：', err.message);
        this.setData({ orders: [], loading: false, dataSource: 'local' });
        this.applyFilter();
        wx.showToast({ title: '后端未启动，暂无订单', icon: 'none' });
      });
  },

  loadStats() {
    api.getSummary()
      .then(s => this.setData({ summary: s }))
      .catch(() => {});
    api.getTopDishes(5)
      .then(list => this.setData({ topDishes: list }))
      .catch(() => {});
  },

  // 切换筛选 tab
  onTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
    this.applyFilter();
  },

  applyFilter() {
    const { activeTab, orders } = this.data;
    let filtered = orders;
    if (activeTab === 'pending') filtered = orders.filter(o => o.status === '待接单');
    else if (activeTab === 'cooking') filtered = orders.filter(o => o.status === '制作中');
    else if (activeTab === 'done') filtered = orders.filter(o => o.status === '已完成');
    this.setData({ filtered });
  },

  // 接单 / 出餐 / 完成 一键流转
  onAction(e) {
    const orderNo = e.currentTarget.dataset.no;
    const order = this.data.orders.find(o => o.id === orderNo);
    if (!order || !order.nextStatus) return;

    api.updateOrderStatus(orderNo, order.nextStatus)
      .then(() => {
        wx.showToast({ title: order.actionText + '成功', icon: 'success' });
        this.loadOrders();
        this.loadStats();
      })
      .catch(err => {
        wx.showToast({ title: '操作失败：' + err.message, icon: 'none' });
      });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadAll();
    wx.stopPullDownRefresh();
  },

  // 退出老板模式
  onLogout() {
    app.globalData.isOwner = false;
    wx.reLaunch({ url: '/pages/index/index' });
  }
});
