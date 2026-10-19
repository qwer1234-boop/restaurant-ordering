// pages/owner-stats/owner-stats.js 老板端经营统计
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    summary: null,
    topDishes: [],
    categoryStats: [],
    loading: true
  },

  onLoad() {
    if (!app.globalData.isOwner) {
      wx.reLaunch({ url: '/pages/owner-login/owner-login' });
      return;
    }
    this.load();
  },

  load() {
    return api.ownerGetStats()
      .then(d => {
        const categoryStats = (d.categoryStats || []).map(c => ({ ...c, amount: Number(c.amount) || 0 }));
        const maxAmount = Math.max(1, ...categoryStats.map(c => c.amount));
        const decoratedCategories = categoryStats.map(c => ({
          ...c,
          percent: Math.round((c.amount / maxAmount) * 100)
        }));
        this.setData({
          summary: d.summary || null,
          topDishes: d.topDishes || [],
          categoryStats: decoratedCategories,
          loading: false
        });
      })
      .catch(err => {
        this.setData({ loading: false });
        if (err && (err.statusCode === 401 || err.code === 401)) {
          app.clearOwnerSession();
          wx.reLaunch({ url: '/pages/owner-login/owner-login' });
          return;
        }
        wx.showToast({ title: err.message || '加载失败', icon: 'none' });
      });
  },

  onPullDownRefresh() {
    this.load().then(
      () => wx.stopPullDownRefresh(),
      () => wx.stopPullDownRefresh()
    );
  }
});
