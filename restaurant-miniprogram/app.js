// app.js 小程序入口
App({
  onLaunch() {
    // 从本地缓存恢复历史订单
    const orders = wx.getStorageSync('orders') || [];
    this.globalData.orders = orders;

    // 老板端登录态（令牌过期后由接口 401 触发重新登录）
    const ownerToken = wx.getStorageSync('ownerToken') || '';
    this.globalData.ownerToken = ownerToken;
    this.globalData.isOwner = !!ownerToken;
  },

  /** 老板登录成功后保存会话 */
  setOwnerSession(token, expiresIn) {
    this.globalData.ownerToken = token;
    this.globalData.isOwner = true;
    this.globalData.ownerTokenExpireAt = Date.now() + Number(expiresIn || 0) * 1000;
    wx.setStorageSync('ownerToken', token);
  },

  /** 退出老板模式 / 令牌失效时清理 */
  clearOwnerSession() {
    this.globalData.ownerToken = '';
    this.globalData.ownerTokenExpireAt = 0;
    this.globalData.isOwner = false;
    wx.removeStorageSync('ownerToken');
  },

  globalData: {
    // 购物车：[{ id, name, price, emoji, count }]
    cart: [],
    // 订单缓存（后端可用时以后端数据为准，否则作为离线兜底）
    orders: [],
    // 后端是否可用（由菜单接口的调用结果决定）
    apiOnline: false,
    // 老板端：是否已登录
    isOwner: false,
    ownerToken: '',
    ownerTokenExpireAt: 0
  }
});
