// utils/dishImages.js  菜品图片映射
// 按「菜品名称」映射到本地图片路径（名称两边都稳定，避免依赖后端/本地 id 不一致）
// 新增菜品：在 images/dishes/ 放入图片，再往下面的 map 加一行即可
// 删改菜品：改 map 或换图片文件即可，图片加载失败会自动回退 default.jpg
const MAP = {
  '宫保鸡丁': '/images/dishes/gongbao-jiding.jpg',
  '红烧肉':   '/images/dishes/hongshaorou.jpg',
  '麻婆豆腐': '/images/dishes/mapo-doufu.png',
  '清蒸鲈鱼': '/images/dishes/qingzheng-luyu.jpg',
  '凉拌黄瓜': '/images/dishes/liangban-huanggua.jpg',
  '口水鸡':   '/images/dishes/koushuiji.jpg',
  '皮蛋豆腐': '/images/dishes/pidan-doufu.jpg',
  '扬州炒饭': '/images/dishes/yangzhou-chaofan.jpg',
  '手工水饺': '/images/dishes/shuijiao.jpg',
  '阳春面':   '/images/dishes/yangchun-mian.jpg',
  '鲜榨橙汁': '/images/dishes/xianzha-chengzhi.jpg',
  '酸梅汤':   '/images/dishes/suanmeitang.jpg',
  '柠檬茶':   '/images/dishes/ningmeng-cha.jpg'
};

const DEFAULT_IMAGE = '/images/dishes/default.jpg';

// 根据菜品名取图片；找不到就回退默认图
function imageFor(name) {
  return MAP[name] || DEFAULT_IMAGE;
}

module.exports = { imageFor, DEFAULT_IMAGE };
