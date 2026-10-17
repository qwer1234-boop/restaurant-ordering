// 从 Wikimedia Commons 按菜品搜索并下载 400px 缩略图
// 用法: node fetch_dish_images.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const OUT_DIR = path.join(__dirname, 'restaurant-miniprogram', 'images', 'dishes');

// [slug, 首选搜索词, 备用搜索词]
const DISHES = [
  ['gongbao-jiding',   'Kung Pao chicken',        'kung pao'],
  ['hongshaorou',      'red braised pork belly',  'hong shao rou'],
  ['mapo-doufu',       'Mapo doufu',              'mapo tofu'],
  ['qingzheng-luyu',   'steamed sea bass',        'steamed fish chinese cuisine'],
  ['liangban-huanggua','smashed cucumber salad',  'cucumber salad chinese'],
  ['koushuiji',        'saliva chicken',          '口水鸡'],
  ['pidan-doufu',      'century egg tofu',        'century egg'],
  ['yangzhou-chaofan', 'Yangzhou fried rice',     'fried rice chinese'],
  ['shuijiao',         'jiaozi',                  'chinese dumplings plate'],
  ['yangchun-mian',    'yangchun noodles',        'chinese noodle soup bowl'],
  ['xianzha-chengzhi', 'fresh orange juice glass','orange juice'],
  ['suanmeitang',      'suanmeitang',             'plum juice drink'],
  ['ningmeng-cha',     'lemon tea',               'iced lemon tea'],
  ['default',          'chinese cuisine dishes',  'chinese food'],
];

const UA = 'WorkBuddyCourseProject/1.0 (student miniprogram demo)';

async function searchImage(term) {
  const u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json'
    + '&generator=search&gsrnamespace=6&gsrlimit=6'
    + '&gsrsearch=' + encodeURIComponent(term + ' filetype:bitmap')
    + '&prop=imageinfo&iiprop=url%7Csize%7Cmime&iiurlwidth=400';
  const raw = execFileSync('curl.exe', ['-sL', '--max-time', '40', '-A', UA, u]).toString('utf8');
  const j = JSON.parse(raw);
  if (!j.query || !j.query.pages) return null;
  const pages = Object.values(j.query.pages);
  // 优先 jpg/png 且原图够大
  for (const p of pages) {
    const ii = p.imageinfo && p.imageinfo[0];
    if (!ii) continue;
    if (!/^image\/(jpeg|png)$/.test(ii.mime)) continue;
    if (ii.width < 300) continue;
    return { title: p.title, thumb: ii.thumburl, mime: ii.mime };
  }
  return null;
}

async function download(url, file) {
  // curl 自动走系统代理（HTTP_PROXY），upload.wikimedia.org 直连不通
  execFileSync('curl.exe', ['-sL', '--retry', '2', '--max-time', '60', '-A', UA, '-o', file, url]);
  const size = fs.statSync(file).size;
  if (size < 5000) { fs.unlinkSync(file); throw new Error('too small: ' + size); }
  return size;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const results = [];
  for (const [slug, term, fallback] of DISHES) {
    let hit = null, usedTerm = term;
    try { hit = await searchImage(term); } catch (e) { }
    if (!hit && fallback) {
      usedTerm = fallback;
      try { hit = await searchImage(fallback); } catch (e) { }
    }
    if (!hit) {
      console.log(slug + ' :: NO RESULT');
      continue;
    }
    const ext = hit.mime === 'image/png' ? '.png' : '.jpg';
    const file = path.join(OUT_DIR, slug + ext);
    try {
      const size = await download(hit.thumb, file);
      console.log(slug + ext + ' :: ' + Math.round(size / 1024) + 'KB :: ' + hit.title + ' :: [' + usedTerm + ']');
    } catch (e) {
      console.log(slug + ' :: DL FAIL ' + e.message + ' :: ' + hit.title);
    }
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
