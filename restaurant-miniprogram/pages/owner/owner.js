// pages/owner/owner.js 老板端订单看板
// 功能：订单筛选、接单/出餐/完成/取消、经营统计入口、菜品管理入口
const api = require('../../utils/api.js');
const app = getApp();

// 后端状态中文 → 样式类 / 步数 / 动作文案
const STATUS_META = {
  '待处理': { type: 'pending', step: 0, action: '接单', next: '制作中' },
  '制作中': { type: 'cooking', step: 1, action: '出餐', next: '已完成' },
  '已完成': { type: 'done', step: 2, action: '', next: '' },
  '已取消': { type: 'cancel', step: -1, action: '', next: '' }
};

function decorate(o) {
  const status = o.status || '待处理';
  const meta = STATUS_META[status] || STATUS_META['待处理'];
  return {
    ...o,
    statusType: meta.type,
    step: meta.step,
    actionText: meta.action,
    nextStatus: meta.next,
    canCancel: status === '待处理' || status === '制作中'
  };
}

Page({
  data: {
    orders: [],
    filtered: [],
    activeTab: 'all',
    loading: true,
    summary: null,
    topDishes: [],
    categoryStats: [],
    isOwner: false
  },

  onLoad() {
    if (!app.globalData.isOwner) {
      wx.reLaunch({ url: '/pages/owner-login/owner-login' });
      return;
    }
    this.setData({ isOwner: true });
    this.loadAll();
  },

  onShow() {
    if (this.data.isOwner) this.loadAll();
  },

  // 订单看板和统计一起刷新，减少页面上的等待空白
  loadAll() {
    return Promise.all([this.loadOrders(), this.loadStats()]);
  },

  // 拉取订单并把后端字段转换成页面使用的结构
  loadOrders() {
    return api.ownerGetOrders(100)
      .then(list => {
        const orders = list.map(o => decorate({
          id: o.orderNo,
          tableNo: o.tableNo,
          note: o.remark,
          items: (o.items || []).map(i => ({
            name: i.name,
            count: i.count,
            price: i.price,
            emoji: i.emoji
          })),
          total: o.totalAmount,
          status: o.status,
          time: o.createdAt
        }));
        this.setData({ orders, loading: false });
        this.applyFilter();
      })
      .catch(err => {
        this.setData({ loading: false });
        this.handleAuthError(err);
      });
  },

  // 统计和订单相互独立，统计失败不阻塞订单看板
  loadStats() {
    return api.ownerGetStats()
      .then(d => {
        this.setData({
          summary: d.summary || null,
          topDishes: d.topDishes || [],
          categoryStats: d.categoryStats || []
        });
      })
      .catch(err => this.handleAuthError(err));
  },

  // 统一处理 401：清掉本地 token 并回登录页；其他错误只 toast
  handleAuthError(err) {
    if (err && (err.statusCode === 401 || err.code === 401)) {
      app.clearOwnerSession();
      wx.reLaunch({ url: '/pages/owner-login/owner-login' });
      return true;
    }
    wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    return false;
  },

  onTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
    this.applyFilter();
  },

  // 前端筛选只影响当前展示，不重新请求后端
  applyFilter() {
    const { activeTab, orders } = this.data;
    let filtered = orders;
    if (activeTab === 'pending') filtered = orders.filter(o => o.status === '待处理');
    else if (activeTab === 'cooking') filtered = orders.filter(o => o.status === '制作中');
    else if (activeTab === 'done') filtered = orders.filter(o => o.status === '已完成');
    else if (activeTab === 'cancelled') filtered = orders.filter(o => o.status === '已取消');
    this.setData({ filtered });
  },

  // 接单 / 出餐 / 完成
  onAction(e) {
    const orderNo = e.currentTarget.dataset.no;
    const order = this.data.orders.find(o => o.id === orderNo);
    if (!order || !order.nextStatus) return;
    this.doUpdate(orderNo, order.nextStatus, order.actionText);
  },

  // 取消订单（库存由后端回退）
  onCancel(e) {
    const orderNo = e.currentTarget.dataset.no;
    wx.showModal({
      title: '取消订单',
      content: '确定取消该订单吗？菜品库存会自动回退。',
      confirmColor: '#f53f3f',
      success: res => {
        if (res.confirm) this.doUpdate(orderNo, '已取消', '取消');
      }
    });
  },

  // 接单/出餐/取消成功后重新拉取订单和统计，保证看板与数据库一致
  doUpdate(orderNo, status, actionText) {
    api.ownerUpdateOrderStatus(orderNo, status)
      .then(() => {
        wx.showToast({ title: actionText + '成功', icon: 'success' });
        return this.loadAll();
      })
      .catch(err => {
        if (!this.handleAuthError(err)) {
          wx.showToast({ title: '操作失败：' + err.message, icon: 'none' });
        }
      });
  },

  onOpenDishes() {
    wx.navigateTo({ url: '/pages/owner-dishes/owner-dishes' });
  },

  onOpenStats() {
    wx.navigateTo({ url: '/pages/owner-stats/owner-stats' });
  },

  onPullDownRefresh() {
    this.loadAll().then(
      () => wx.stopPullDownRefresh(),
      () => wx.stopPullDownRefresh()
    );
  },

  onLogout() {
    app.clearOwnerSession();
    wx.switchTab({ url: '/pages/index/index' });
  }
});
