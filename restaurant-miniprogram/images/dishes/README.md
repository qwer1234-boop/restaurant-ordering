# 菜品图片管理说明

小程序已支持**本地菜品图片**（不再只用 emoji）。所有图片放在：

```
restaurant-miniprogram/images/dishes/
```

共 14 张（13 道菜 + 1 张默认兜底图 `default.jpg`）。

## 一、文件与映射的关系

图片**按菜品名称**关联（不依赖菜品 ID，避免后端 id=1~13 和本地 id=101~403 不一致的问题）。

映射表在 `restaurant-miniprogram/utils/dishImages.js` 的 `MAP` 里：

```js
const MAP = {
  '宫保鸡丁': '/images/dishes/gongbao-jiding.jpg',
  '红烧肉':   '/images/dishes/hongshaorou.jpg',
  ...
};
```

`imageFor(name)` 按名称查表，查不到就返回 `default.jpg`。图片加载失败（被删/路径错）时，页面也会自动回退到默认图，不会显示空白。

## 二、怎么改某道菜的图

1. 把新图放进 `images/dishes/`（建议 400px 左右、jpg/png、正方形，太大拖慢加载）
2. 改 `utils/dishImages.js` 里对应菜品那一行的文件名即可

例如把宫保鸡丁换成 `gongbao2.jpg`：

```js
'宫保鸡丁': '/images/dishes/gongbao2.jpg',
```

## 三、怎么加一道菜

1. 在**后端** `restaurant-java/sql/seed.sql` 和**本地兜底** `data/dishes.js` 里各加一条菜品
2. 图片放进 `images/dishes/`，例如 `images/dishes/yuxiang-rousi.jpg`
3. 在 `utils/dishImages.js` 的 `MAP` 里加一行：

```js
'鱼香肉丝': '/images/dishes/yuxiang-rousi.jpg',
```

不加映射也没关系，会自动用 `default.jpg`。

## 四、怎么删一道菜

1. 后端删掉对应菜品记录，本地 `data/dishes.js` 同步删
2. `utils/dishImages.js` 里删掉那一行（可选）
3. 图片文件可删可留；删了也不报错（回退默认图）

## 五、图片来源与版权

13 张菜品图来自 **Wikimedia Commons**（知识共享授权，可自由使用、用于课程作业）。抓取脚本见项目根目录 `fetch_dish_images.js`（可重复运行，重新抓取最新图片）。

> 提示：Commons 上西餐/冷门菜品图偶尔会不准，若发现某张图和菜名不符，直接按「二」的方法替换成你自己拍的图即可。
