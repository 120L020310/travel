# Travel Reverie 6.4 · Theme Component Notes

## Compact journal architecture

非 Oil Theme 的 Card 现在拥有两套互斥结构：

```text
Collapsed:
media-frame
└── memory-compact-summary
    ├── city / date / country
    ├── expand
    └── edit

Expanded:
media-frame
card-content
├── full story
├── coordinates
├── original edit
└── collapse
```

缩略状态下 `card-content` 使用 `display:none`，因此不会保留日记写作区域的高度。

## Theme renderers

```text
PaintingMemoryCard
Y2KMemoryCard
FilmMemoryCard
SketchbookMemoryCard
WatercolorMemoryCard
```

Oil Painting 不生成 compact summary，继续使用原组件。

## Font synchronization

`app-v6-4.js` 将 Theme Studio 的字体写入：

```text
--theme-selected-font
--ui-font
--body-font
--display-font
```

后四个 Theme 的阅读字体使用这些变量。Pixel、Timecode 等界面微文字仍保留 Theme 专属字体。

## Color capabilities

```text
Oil:         title / ink / accent / paper
Y2K:         title / ink / accent / paper
Film:        title / ink / accent
Sketchbook:  title / ink / accent / paper
Watercolor:  title / ink / accent / paper
```

Film 的 paper 控件被禁用并显示灰色，而不是允许点击但不产生效果。

## Film board editor

`film-board-editor-v6-4.js` 使用独立 IndexedDB：

```text
Database: travel-reverie-film-reference-v1
Store:    images
Key:      slot
```

支持六个 Film slot 的替换与恢复默认。旅行日志 JSON 不包含这些自定义图片。
