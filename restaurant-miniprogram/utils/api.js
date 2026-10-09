// utils/api.js 后端接口封装
// 说明：开发阶段在微信开发者工具中需勾选「详情 → 本地设置 → 不校验合法域名」，
//      这样 http://localhost 才能被请求（项目配置里已默认关闭域名校验）。
//
// 后端地址切换：
//   Java 后端（Spring Boot + MyBatis + MySQL）→ http://localhost:8080/api
//   Node 后端（Express + SQLite，备用）        → http://localhost:3000/api
const BASE_URL = 'http://localhost:8080/api';

/**
 * 统一请求方法
 * @param {string} url    接口路径，如 '/dishes'
 * @param {string} method GET / POST / PUT
 * @param {object} data   请求体（POST/PUT）或查询参数（GET）
 * @returns Promise<data> 直接返回后端响应中的 data 字段
 */
function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: { 'content-type': 'application/json' },
      timeout: 8000,
      success(res) {
        const body = res.data;
        if (res.statusCode === 200 && body && body.code === 0) {
          resolve(body.data);
        } else {
          reject(new Error((body && body.message) || `请求失败（HTTP ${res.statusCode}）`));
        }
      },
      fail(err) {
        reject(new Error('无法连接后端服务，请确认已执行 npm start'));
      }
    });
  });
}

module.exports = {
  BASE_URL,
  request,

  // 菜单
  getCategories: () => request('/categories'),
  getDishes: (categoryId) => request(categoryId ? `/dishes?categoryId=${categoryId}` : '/dishes'),

  // 餐桌
  getTables: () => request('/tables'),

  // 订单
  createOrder: (payload) => request('/orders', 'POST', payload),
  getOrders: (limit = 20) => request(`/orders?limit=${limit}`),
  getOrderDetail: (orderNo) => request(`/orders/${orderNo}`),
  updateOrderStatus: (orderNo, status) => request(`/orders/${orderNo}/status`, 'PUT', { status }),

  // 统计
  getSummary: () => request('/stats/summary'),
  getTopDishes: (limit = 5) => request(`/stats/top?limit=${limit}`)
};
