# Chart.js + Node.js Canvas 图表生成工作流

## 快速开始

```bash
mkdir -p /tmp/chart_gen && cd /tmp/chart_gen
npm init -y && npm install chart.js canvas
```

字体注册（macOS，**必须**，否则中文显示为方块）：
```javascript
const { registerFont } = require('canvas');
registerFont('/System/Library/Fonts/STHeiti Light.ttc', { family: 'STHeiti Light', weight: '300' });
registerFont('/System/Library/Fonts/STHeiti Medium.ttc', { family: 'STHeiti', weight: 'normal' });
registerFont('/System/Library/Fonts/Hiragino Sans GB.ttc', { family: 'Hiragino Sans GB', weight: 'normal' });
registerFont('/System/Library/Fonts/Supplemental/Songti.ttc', { family: 'Songti SC', weight: 'normal' });
```

全局字体默认值（每个图表组件仍需显式设 font.size）：
```javascript
Chart.defaults.font.family = 'STHeiti Light';
Chart.defaults.color = '#37474F';
```

## 字号规范（重要 — 用户明确反馈过字小）

| 元素 | 最小字号 | 推荐字号 |
|------|---------|---------|
| 图表标题 | 16pt | **18pt** |
| 副标题/图例 | 12pt | **14pt** |
| 坐标轴标签/刻度 | 11pt | **12pt** |
| 策略区正文（Canvas手绘） | 10pt | **11-13pt** |
| 项目列表（Canvas手绘） | 12pt | **13pt** |

**教训**：v1图表用title=15/legend=11/tick=10 → 用户反馈"文字非常小"。v2统一放大2pt后改善。

## Canvas API 手绘图表（SWOT/流程图等复杂图）

适用场景：四象限图、流程图、战略时间轴等 Chart.js 不擅长的类型。

### roundRect pitfall

Node.js canvas 的 `ctx.roundRect(x, y, w, h, r)` 是原生 API（v2.14+）。如果代码中定义了局部的 `roundRect` helper 函数并与原生 API 同名，会产生冲突。

**正确做法**：使用原生 API，不自定义 wrapper：
```javascript
ctx.beginPath();
ctx.roundRect(cardX, cardY, cardW, cardH, 7);
ctx.fill();
```

如果自定义 helper（用于跨平台兼容性），确保定义在所有图表函数之前作为全局函数。

### wrapText 函数 pitfall

Canvas 没有自动换行，文本超宽时需要手动截断。如果 `wrapText` 接收到的 `text` 参数是 `undefined`，会崩溃：

```javascript
function wrapText(ctx, text, maxW) {
  if (!text) return [''];  // ✅ 加这个守卫
  // ...
}
```

典型错误来源：`const stratItems = [{ label: 'SO', text: STRAT.SO, ... }]` 中，如果 `STRAT` 对象里某个 key 拼写错误（如 `STRAT.WT` 写成 `STRAT.T`），读取到的是 `undefined` 而非报错。

## 完整示例结构

```javascript
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');
const fs = require('fs');

// 1. 字体注册
registerFont('/System/Library/Fonts/STHeiti Light.ttc', { family: 'STHeiti Light', weight: '300' });
// ... 其他字体

// 2. 画布
const W = 900, H = 600;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#FAFAFA';
ctx.fillRect(0, 0, W, H);

// 3. 数据
const DATA = { ... };

// 4. 工具函数（全局定义）
function wrapText(ctx, text, maxW) { ... }

// 5. 各图表函数
function chartRevenue(ctx) { ... }
function chartProfit(ctx) { ... }
function chartSWOT(ctx) { ... }
function chartFocus(ctx) { ... }
function chartTimeline(ctx) { ... }

// 6. 执行 + 保存
chartSWOT(ctx);
fs.writeFileSync('/tmp/imgs/chart_swot.png', canvas.toBuffer('image/png'));
```

## 输出验证

```bash
ls -lh /tmp/chart_gen/imgs/
# chart_revenue.png   35-60KB  ✅ 正常
# chart_profit.png   18-30KB  ✅ 正常
# chart_swot.png     40-200KB ✅ 正常（复杂图更大）
# chart_focus.png    50-80KB  ✅ 正常
# chart_timeline.png 50-80KB  ✅ 正常
```

尺寸参考（900×600 画布，PNG）：
- 简单柱/条形图：20-40KB
- 组合图（柱+折线）：35-50KB
- 四象限SWOT图：60-200KB（取决于内容复杂度）
- 流程图：50-80KB