/**
 * 统一响应格式工具
 * 所有接口返回：{ code, message, data }
 *   code = 0    表示成功
 *   code != 0   表示业务/系统错误
 */
function ok(res, data = null, message = 'ok') {
  res.json({ code: 0, message, data });
}

function fail(res, message = '服务器内部错误', code = 500, httpStatus = 200) {
  res.status(httpStatus).json({ code, message, data: null });
}

module.exports = { ok, fail };
