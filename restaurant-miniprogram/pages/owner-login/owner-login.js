// pages/owner-login/owner-login.js 老板端登录页
// 密码由后端 /api/owner/login 校验，登录成功后保存短期令牌
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    pwd: '',
    error: '',
    shaking: false,
    loading: false
  },

  onInput(e) {
    this.setData({ pwd: e.detail.value, error: '' });
  },

  onLogin() {
    if (this.data.loading) return;
    const pwd = this.data.pwd.trim();
    if (!pwd) {
      this.setData({ error: '请输入老板密码' });
      return;
    }

    this.setData({ loading: true, error: '' });
    api.ownerLogin(pwd)
      .then(res => {
        app.setOwnerSession(res.token, res.expiresIn);
        wx.reLaunch({ url: '/pages/owner/owner' });
      })
      .catch(err => {
        this.setData({ error: err.message || '登录失败', shaking: true });
        setTimeout(() => this.setData({ shaking: false }), 400);
      })
      .then(() => this.setData({ loading: false }));
  },

  onCancel() {
    wx.navigateBack();
  }
});
