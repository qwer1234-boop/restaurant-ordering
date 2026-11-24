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

  // 输入密码时清掉上一次的错误提示
  onInput(e) {
    this.setData({ pwd: e.detail.value, error: '' });
  },

  // 登录：前端只做必填校验，密码是否正确由后端判断
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
        // 登录成功：保存 token，跳到订单看板
        app.setOwnerSession(res.token, res.expiresIn);
        wx.reLaunch({ url: '/pages/owner/owner' });
      })
      .catch(err => {
        // 失败时显示后端 message，并触发一次抖动动画
        this.setData({ error: err.message || '登录失败', shaking: true });
        setTimeout(() => this.setData({ shaking: false }), 400);
      })
      .then(() => this.setData({ loading: false }));
  },

  // 取消：返回上一页，不保存任何登录态
  onCancel() {
    wx.navigateBack();
  }
});
