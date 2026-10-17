// app.js 小程序入口
App({
  onLaunch() {
    // 从本地缓存恢复历史订单
    const orders = wx.getStorageSync('orders') || [];
    this.globalData.orders = orders;
  },

  globalData: {
    // 购物车：[{ id, name, price, emoji, count }]
    cart: [],
    // 订单缓存（后端可用时以后端数据为准，否则作为离线兜底）
    orders: [],
    // 后端是否可用（由菜单接口的调用结果决定）
    apiOnline: false,
    // 老板端：是否已通过密码校验
    isOwner: false,
    // 老板密码（默认 8888，可在此修改）
    ownerPassword: '8888'
  }
});
