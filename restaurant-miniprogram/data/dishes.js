// data/dishes.js 菜品数据
// 用 emoji 作为菜品图标，无需额外图片资源，导入即可运行
const categories = [
  { id: 1, name: '热菜' },
  { id: 2, name: '凉菜' },
  { id: 3, name: '主食' },
  { id: 4, name: '饮品' }
];

const dishes = [
  { id: 101, categoryId: 1, name: '宫保鸡丁', price: 28, emoji: '🍗', desc: '经典川菜，微辣下饭', sales: 326 },
  { id: 102, categoryId: 1, name: '红烧肉', price: 36, emoji: '🥩', desc: '肥而不腻，入口即化', sales: 289 },
  { id: 103, categoryId: 1, name: '麻婆豆腐', price: 18, emoji: '🌶️', desc: '麻辣鲜香，嫩滑入味', sales: 210 },
  { id: 104, categoryId: 1, name: '清蒸鲈鱼', price: 48, emoji: '🐟', desc: '鲜嫩清爽，原汁原味', sales: 156 },
  { id: 201, categoryId: 2, name: '凉拌黄瓜', price: 8, emoji: '🥒', desc: '爽脆开胃', sales: 402 },
  { id: 202, categoryId: 2, name: '口水鸡', price: 26, emoji: '🐔', desc: '麻辣鲜香，回味无穷', sales: 188 },
  { id: 203, categoryId: 2, name: '皮蛋豆腐', price: 12, emoji: '🥗', desc: '清凉嫩滑', sales: 143 },
  { id: 301, categoryId: 3, name: '扬州炒饭', price: 16, emoji: '🍚', desc: '粒粒分明，配料丰富', sales: 351 },
  { id: 302, categoryId: 3, name: '手工水饺', price: 20, emoji: '🥟', desc: '12只装，猪肉白菜馅', sales: 275 },
  { id: 303, categoryId: 3, name: '阳春面', price: 12, emoji: '🍜', desc: '汤鲜面滑', sales: 199 },
  { id: 401, categoryId: 4, name: '鲜榨橙汁', price: 15, emoji: '🍊', desc: '现点现榨', sales: 233 },
  { id: 402, categoryId: 4, name: '酸梅汤', price: 8, emoji: '🥤', desc: '解辣解腻', sales: 310 },
  { id: 403, categoryId: 4, name: '柠檬茶', price: 10, emoji: '🍋', desc: '清新酸甜', sales: 264 }
];

module.exports = { categories, dishes };
