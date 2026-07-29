# Travel Reverie 7.4.1 · Route Waypoints

## 1. 浏览器数据持久化与模型解绑

当前开发版会在同一浏览器、同一网页来源下自动保存并恢复用户数据，不需要后端。

- 旅行日志、真实旅行路线和主题设置分别写入独立的 LocalStorage 记录。
- 照片与视频继续保存在当前浏览器的 IndexedDB。
- 现有 V6 数据会在首次打开 7.2 时迁移：5 次真实旅行会保存为独立地点快照。
- 修改旅行日志不会再改变真实旅行路线、平面地图或立体地图。
- 分类与归档继续只根据旅行日志更新。
- 可新建、编辑、删除一次真实旅行；路线地点也可独立新增、编辑、删除和上下排序。
- 足迹地图侧栏固定为旅行列表滚动区；每次旅行保留相同卡片高度，外层可上下滚动切换旅行。
- 每张旅行卡片内的完整地点列表也可直接上下滚动浏览。
- 平面地图会在每个路线坐标上显示与路线等宽的小红点，便于识别途经位置。
- 每张旅行卡片的右上角固定显示“编辑”，无需滚动到地点列表底部。
- 路线地点可通过按钮搜索地址并选择经纬度，地图只读取这些路线快照。

本阶段移除了 JSON 导入导出入口；后续桌面 App 将复用同一数据模型，把浏览器存储适配为本地项目文件夹。

---

# Travel Reverie 6.4 · Compact Journal & Theme Studio Sync

本版本直接建立在 6.3 上，没有修改 Oil Painting 的页面结构、动画或卡片设计。

## 1. 后四个 Memory 的日志空白已从布局中删除

之前的“缩略”只是隐藏正文，白色或纸张式的写作面板仍然占据高度。

6.4 改为：

- 缩略状态完全隐藏 `.card-content`。
- 城市、日期、国家、展开和编辑按钮直接叠加在封面底部。
- 卡片高度只由封面决定，不再保留空白日记区域。
- 展开后才恢复完整日记正文、坐标和收起按钮。
- Oil Painting 继续保持原来的日志卡片，不应用这一规则。

不同风格的缩略栏仍然独立：

- Y2K：电脑窗口状态栏
- Film：电影海报字幕条
- Sketchbook：纸张批注条
- Watercolor：透明颜料说明层

## 2. 字体同步

Theme Studio 中的“展示字体”现在会同步到后四个 Memory：

- Hero 标题
- Journey 标题
- Card 标题
- 正文
- Archive
- Route 标题与摘要
- Closing

每个风格的界面微文字仍保留必要的设计语言，例如 Film 时间码和 Y2K 窗口系统标签。

## 3. 页面颜色同步

标题颜色、正文字色、点缀颜色和卡片底色现在会实际影响后四个 Memory，并按照各自视觉语言混合：

- Y2K：柔和电子杂志渐变与窗口描边
- Film：暗色胶片基底、字幕和时间码
- Sketchbook：纸张、墨水和批注颜色
- Watercolor：透明颜料扩散和纸面

背景场景选择也会转化为各 Theme 自己的颜色版本，而不是仅影响 Oil Painting。

Film 的“卡片底色”因暗色胶片系统被锁定，在 Theme Studio 中会变灰并不可点击，避免出现看似可用但实际无效果的控件。

## 4. Film 路线文字

Film 的缩略路线卡现在强制显示：

- 阶段标题
- 真实城市顺序
- 正确的文字颜色
- 正常高度

无需先点击 Expand 才能看到文字。

## 5. Film 图片可编辑

电影地点图集中的六张图片都增加：

- 更换图片
- 恢复默认

自定义图片：

- 保存在当前浏览器的 IndexedDB
- 刷新页面后仍保留
- 不写入旅行日志 JSON
- 最大 12MB
- 恢复默认后重新使用项目内置 WebP

## 6. Sketchbook Hero

修复“已收藏多少目的地”卡片显示不完整：

- 调整卡片宽度和内边距
- 缩小并限制数字字号
- 取消错误裁切
- 保证说明文字完整显示

## 7. Y2K Emoji

Hero 新增：

- 🍓 💿 📷 🎧 🍬 🫧 🩵 🐇
- `(๑˃̵ᴗ˂̵)و`
- `ฅ^•ﻌ•^ฅ`

Journal、Map、Archive 的外侧边缘也加入少量 🎀、🐱、🦋、📷 等漂浮元素。

所有 Emoji：

- 位于装饰最上层
- 使用 `pointer-events:none`
- 分布在阅读区域外侧
- 不遮挡标题、正文和按钮
- 其它 Memory 中不会显示

## 启动

关闭旧服务器，运行：

```text
START-TRAVEL-REVERIE.command
```

或者：

```bash
python3 -m http.server 8000
```

访问：

```text
http://localhost:8000/?build=7.2-modular-routes
```

控制台应显示：

```text
[Travel Reverie] build 7.4.1-route-waypoints loaded
[Travel Reverie] separate memory card components 6.4 loaded
[Travel Reverie] editable Film reference board 6.4 loaded
[Travel Reverie] creative experience 6.4 loaded
```
