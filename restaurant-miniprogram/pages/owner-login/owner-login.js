// pages/owner-login/owner-login.js 老板端登录页
// 通过密码区分老板与顾客，校验通过后进入订单看板
const app = getApp();

// 老板密码（默认 8888，可在 app.globalData.ownerPassword 覆盖）
const DEFAULT_PASSWORD = '8888';

Page({
  data: {
    pwd: '',          // 输入的密码
    error: '',        // 错误提示
    shaking: false    // 密码错误抖动动画
  },

  onInput(e) {
    this.setData({ pwd: e.detail.value, error: '' });
  },

  // 密码校验，通过则跳转老板端
  onLogin() {
    const pwd = this.data.pwd.trim();
    const expect = app.globalData.ownerPassword || DEFAULT_PASSWORD;

    if (!pwd) {
      this.setData({ error: '请输入老板密码' });
      return;
    }
    if (pwd !== expect) {
      // 错误提示 + 抖动
      this.setData({ error: '密码错误，请重试', shaking: true });
      setTimeout(() => this.setData({ shaking: false }), 400);
      return;
    }

    app.globalData.isOwner = true;
    wx.reLaunch({ url: '/pages/owner/owner' });
  },

  // 取消返回
  onCancel() {
    wx.navigateBack();
  }
});
