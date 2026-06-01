#!/usr/bin/env node
/**
 * Chart.js + canvas 生成报告图表（Node.js）
 * 用法：node chart-gen-nodejs.js
 * 依赖：npm install chart.js canvas
 * 输出：/tmp/chart_gen/imgs/
 */
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');
const fs = require('fs');
const path = require('path');

const OUT_DIR = '/tmp/chart_gen/imgs';
fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── 字体注册（macOS）──────────────────────────────
try {
  const { registerFont } = require('canvas');
  registerFont('/System/Library/Fonts/STHeiti Light.ttc',   { family: 'STHeiti Light', weight: '300' });
  registerFont('/System/Library/Fonts/STHeiti Medium.ttc',  { family: 'STHeiti',      weight: 'normal' });
  registerFont('/System/Library/Fonts/Hiragino Sans GB.ttc',{ family: 'Hiragino Sans GB', weight: 'normal' });
  registerFont('/System/Library/Fonts/Supplemental/Songti.ttc', { family: 'Songti SC', weight: 'normal' });
  console.log('字体注册完成: STHeiti, Hiragino Sans GB, Songti SC');
} catch(e) {
  console.log('字体注册跳过:', e.message);
}

const FONT = 'STHeiti Light';

// ─── 通用工具 ─────────────────────────────────────
function saveChart(config, filename, w = 860, h = 500) {
  const canvas = createCanvas(w, h);
  config.options = config.options || {};
  config.options.responsive = false;
  config.options.animation = false;
  const ctx = canvas.getContext('2d');
  new Chart(ctx, config);
  const buf = canvas.toBuffer('image/png');
  const fp = path.join(OUT_DIR, filename);
  fs.writeFileSync(fp, buf);
  console.log(`✅ ${filename} (${Math.round(buf.length/1024)}KB)`);
  return fp;
}

// ─── 图1：营收利润趋势（柱+双折线）────────────────
function chart1() {
  saveChart({
    type: 'bar',
    data: {
      labels: ['2022年', '2023年', '2024年'],
      datasets: [
        {
          type: 'bar',
          label: '营业收入（亿元）',
          data: [6.7, 8.5, 9.62],
          backgroundColor: 'rgba(54,117,200,0.75)',
          borderColor: 'rgba(54,117,200,1)',
          borderWidth: 1,
          yAxisID: 'y',
          barPercentage: 0.5,
        },
        {
          type: 'line',
          label: '利润总额（亿元）',
          data: [0.15, 0.21, 0.256],
          borderColor: 'rgba(255,152,0,1)',
          backgroundColor: 'rgba(255,152,0,0.1)',
          borderWidth: 2.5,
          pointRadius: 5,
          tension: 0.3,
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: '净利润率（%）',
          data: [2.24, 2.47, 2.66],
          borderColor: 'rgba(76,175,80,1)',
          borderWidth: 2,
          borderDash: [6, 3],
          pointRadius: 4,
          tension: 0.3,
          yAxisID: 'y2',
        }
      ]
    },
    options: {
      plugins: {
        title: { display: true, text: '数产集团营收与利润趋势（2022-2024）',
          font: { size: 15, weight: 'bold', family: FONT }, color: '#1a1a2e' },
        legend: { position: 'top', labels: { font: { size: 11, family: FONT }, usePointStyle: true } },
      },
      scales: {
        y: { type: 'linear', position: 'left', title: { display: true, text: '金额（亿元）', font: { size: 11, family: FONT } },
          grid: { color: 'rgba(0,0,0,0.06)' } },
        y2: { type: 'linear', position: 'right', title: { display: true, text: '净利润率（%）', font: { size: 11, family: FONT } },
          grid: { drawOnChartArea: false }, ticks: { callback: v => v + '%' }, min: 0, max: 6 },
        x: { grid: { display: false } },
      }
    }
  }, 'chart_revenue.png', 860, 500);
}

// ─── 图2：净利润率对标（水平条形图）──────────────
function chart2() {
  saveChart({
    type: 'bar',
    options: {
      indexAxis: 'y',
      plugins: {
        title: { display: true, text: '净利润率对标分析', font: { size: 15, weight: 'bold', family: FONT }, color: '#1a1a2e' },
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` 净利润率: ${ctx.raw}%` } },
      },
      scales: {
        x: { title: { display: true, text: '净利润率（%）', font: { size: 11, family: FONT } },
          grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { callback: v => v + '%' }, max: 25 },
        y: { ticks: { font: { size: 12, family: FONT } }, grid: { display: false } },
      }
    },
    data: {
      labels: ['数产集团', '华润数科', '宝信软件', '达梦数据'],
      datasets: [{
        data: [2.5, 10.0, 16.6, 22.0],
        backgroundColor: ['rgba(244,67,54,0.8)','rgba(255,152,0,0.8)','rgba(76,175,80,0.8)','rgba(33,150,243,0.85)'],
        borderRadius: 4,
      }]
    }
  }, 'chart_profit.png', 800, 380);
}

// ─── 图3：SWOT矩阵（四象限手绘）──────────────────
function chart3() {
  const canvas = createCanvas(820, 620);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, 820, 620);

  const cx = 410, cy = 310, rx = 340, ry = 260;

  // 四个象限背景
  const quads = [
    { x: cx, y: cy-ry, w: rx, h: ry, color: 'rgba(33,150,243,0.07)', label: 'SO 杠杆效应' },
    { x: cx-rx, y: cy-ry, w: rx, h: ry, color: 'rgba(255,152,0,0.07)', label: 'WO 扭转型' },
    { x: cx-rx, y: cy, w: rx, h: ry, color: 'rgba(244,67,54,0.07)', label: 'WT 防御型' },
    { x: cx, y: cy, w: rx, h: ry, color: 'rgba(76,175,80,0.07)', label: 'ST 进攻型' },
  ];
  for (const q of quads) {
    ctx.fillStyle = q.color;
    ctx.fillRect(q.x, q.y, q.w, q.h);
  }

  // 象限标签
  const labels = [
    { x: cx+10, y: cy-ry+18, text: 'SO 杠杆效应', color: 'rgba(33,150,243,0.9)' },
    { x: cx-rx+10, y: cy-ry+18, text: 'WO 扭转型', color: 'rgba(255,152,0,0.9)' },
    { x: cx-rx+10, y: cy+18, text: 'WT 防御型', color: 'rgba(244,67,54,0.9)' },
    { x: cx+10, y: cy+18, text: 'ST 进攻型', color: 'rgba(76,175,80,0.9)' },
  ];
  ctx.font = `bold 12px ${FONT}`;
  for (const l of labels) { ctx.fillStyle = l.color; ctx.fillText(l.text, l.x, l.y); }

  // 十字线
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1;
  ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(60, cy); ctx.lineTo(760, cy);
  ctx.moveTo(cx, 40); ctx.lineTo(cx, 570);
  ctx.stroke(); ctx.setLineDash([]);

  // 轴标签
  ctx.font = `11px ${FONT}`; ctx.fillStyle = '#666';
  ctx.fillText('外部机会/威胁 →', 700, cy+16);
  ctx.fillText('内部能力 ↑', cx+8, 48);

  // 数据点
  const points = [
    { label: 'S1: 湖北交投生态', x: 85, y: 78, color: 'rgba(33,150,243,0.85)' },
    { label: 'S2: 集团内部协同', x: 80, y: 72, color: 'rgba(33,150,243,0.85)' },
    { label: 'S3: 地方政策支持', x: 72, y: 68, color: 'rgba(33,150,243,0.85)' },
    { label: 'W1: 研发人员占比低', x: 65, y: 22, color: 'rgba(255,152,0,0.85)' },
    { label: 'W2: 产品线分散', x: 58, y: 18, color: 'rgba(255,152,0,0.85)' },
    { label: 'W3: 盈利能力弱', x: 52, y: 15, color: 'rgba(255,152,0,0.85)' },
    { label: 'O1: 信创替代机遇', x: 20, y: 82, color: 'rgba(76,175,80,0.85)' },
    { label: 'O2: 国资数字化', x: 25, y: 75, color: 'rgba(76,175,80,0.85)' },
    { label: 'O3: AI赋能需求', x: 15, y: 70, color: 'rgba(76,175,80,0.85)' },
    { label: 'T1: 大厂竞争挤压', x: 88, y: 30, color: 'rgba(244,67,54,0.85)' },
    { label: 'T2: 人才流失风险', x: 82, y: 22, color: 'rgba(244,67,54,0.85)' },
    { label: 'T3: 成本上涨压力', x: 75, y: 18, color: 'rgba(244,67,54,0.85)' },
  ];
  for (const pt of points) {
    const px = cx + (pt.x/100)*rx - rx/2;
    const py = cy - (pt.y/100)*ry + ry/2;
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2);
    ctx.fillStyle = pt.color; ctx.fill();
    ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = `10px ${FONT}`; ctx.fillStyle = '#333';
    const labelX = px+9, labelY = py+4;
    const tw = ctx.measureText(pt.label).width;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(labelX-2, labelY-10, tw+4, 14);
    ctx.fillStyle = '#333'; ctx.fillText(pt.label, labelX, labelY);
  }

  // 标题
  ctx.font = `bold 15px ${FONT}`; ctx.fillStyle = '#1a1a2e';
  ctx.fillText('数产集团SWOT战略矩阵', 280, 28);

  const buf = canvas.toBuffer('image/png');
  const fp = path.join(OUT_DIR, 'chart_swot.png');
  fs.writeFileSync(fp, buf);
  console.log(`✅ chart_swot.png (${Math.round(buf.length/1024)}KB)`);
}

// ─── 图4：产品聚焦路径 ────────────────────────────
function chart4() {
  const canvas = createCanvas(900, 560);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f9f9fb'; ctx.fillRect(0, 0, 900, 560);
  ctx.font = `bold 15px ${FONT}`; ctx.fillStyle = '#1a1a2e';
  ctx.fillText('产品线聚焦路径：从47个子产品到2条战略主线', 195, 32);

  const COL = {
    focus1: 'rgba(33,150,243,0.9)',
    focus2: 'rgba(76,175,80,0.9)',
    retain: 'rgba(255,152,0,0.85)',
    exit: 'rgba(158,158,158,0.6)',
  };

  function box(x, y, w, h, fill, text, tc='white', fs=11, bold=false) {
    ctx.beginPath();
    const r = 8;
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.font = `${bold ? 'bold ' : ''}${fs}px ${FONT}`;
    ctx.fillStyle = tc; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = text.split('\n');
    const lh = fs + 4, startY = y+h/2 - ((lines.length-1)*lh)/2;
    lines.forEach((l,i) => ctx.fillText(l, x+w/2, startY+i*lh));
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }

  function arrow(x1,y1,x2,y2,color='rgba(100,100,100,0.6)',dashed=false) {
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.setLineDash(dashed ? [5,4] : []); ctx.beginPath();
    ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.setLineDash([]);
    const ang = Math.atan2(y2-y1,x2-x1), al = 9;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(x2,y2);
    ctx.lineTo(x2-al*Math.cos(ang-Math.PI/7), y2-al*Math.sin(ang-Math.PI/7));
    ctx.lineTo(x2-al*Math.cos(ang+Math.PI/7), y2-al*Math.sin(ang+Math.PI/7));
    ctx.closePath(); ctx.fill();
  }

  box(40,75,195,420,'rgba(90,103,216,0.1)','现状\n47个子产品\n分散布局','#3d3d6b',12,true);
  box(270,85,145,55,COL.focus1,'智慧交通','white',12,true);
  box(270,170,145,55,COL.focus2,'企业数字化','white',12,true);
  box(270,255,145,55,COL.retain,'信创服务','white',12,true);
  box(270,360,145,55,COL.exit,'其余产品线\n逐步退出','#777',11,false);
  box(500,60,340,95,COL.focus1,'主线一：智慧交通\n核心产品 · 区域龙头','white',12,true);
  box(500,180,340,95,COL.focus2,'主线二：企业数字化\n产品标准化 · 规模复制','white',12,true);
  box(500,305,340,65,COL.retain,'辅助：信创服务（持续贡献现金流）','white',11,true);
  box(500,390,340,55,COL.exit,'其余产品线 → 有序退出或转让','#777',11,false);

  arrow(235,112,270,112,COL.focus1);
  arrow(235,197,270,197,COL.focus2);
  arrow(235,282,270,282,COL.retain);
  arrow(235,387,270,387,COL.exit,true);
  arrow(415,112,500,107,COL.focus1);
  arrow(415,197,500,227,COL.focus2);
  arrow(415,282,500,337,COL.retain,true);
  arrow(415,387,500,417,COL.exit,true);

  const legends = [
    { color: COL.focus1, label: '主线聚焦' },
    { color: COL.focus2, label: '整合深耕' },
    { color: COL.retain, label: '选择性保留' },
    { color: COL.exit, label: '有序退出' },
  ];
  legends.forEach((lg,i) => {
    const lx=40, ly=495+i*16;
    ctx.fillStyle = lg.color;
    ctx.beginPath(); ctx.arc(lx+5,ly-3,5,0,Math.PI*2); ctx.fill();
    ctx.font = `10px ${FONT}`; ctx.fillStyle = '#555'; ctx.fillText(lg.label, lx+14, ly);
  });

  const buf = canvas.toBuffer('image/png');
  const fp = path.join(OUT_DIR, 'chart_focus.png');
  fs.writeFileSync(fp, buf);
  console.log(`✅ chart_focus.png (${Math.round(buf.length/1024)}KB)`);
}

// ─── 图5：战略时间轴（2026-2030）──────────────────
function chart5() {
  const stages = [
    { year:'2026', color:'rgba(90,103,216,0.85)', items:[
      { label:'营收目标', value:'营收15亿', sub:'年均+20%' },
      { label:'利润目标', value:'净利润率5%', sub:'缩小差距' },
      { label:'研发目标', value:'研发人员25%', sub:'人才引进' },
    ]},
    { year:'2027', color:'rgba(33,150,243,0.85)', items:[
      { label:'营收目标', value:'营收15亿', sub:'年均+20%' },
      { label:'利润目标', value:'净利润率5%', sub:'缩小差距' },
      { label:'研发目标', value:'研发人员25%', sub:'人才引进' },
    ]},
    { year:'2028', color:'rgba(76,175,80,0.85)', items:[
      { label:'核心产品壁垒', value:'技术护城河', sub:'行业认可' },
      { label:'标杆案例复制', value:'3+行业', sub:'省外扩张' },
      { label:'省外扩张', value:'核心产品出省', sub:'规模效应' },
    ]},
    { year:'2029', color:'rgba(255,152,0,0.85)', items:[
      { label:'营收目标', value:'营收20亿', sub:'规模效应显现' },
      { label:'利润目标', value:'净利润率8%', sub:'盈利改善' },
      { label:'研发目标', value:'研发人员30%', sub:'创新驱动' },
    ]},
    { year:'2030', color:'rgba(244,67,54,0.85)', items:[
      { label:'行业地位', value:'行业第一梯队', sub:'区域龙头' },
      { label:'净利润率', value:'净利润率10%+', sub:'接近标杆' },
      { label:'研发人员', value:'研发人员35%', sub:'顶尖人才' },
    ]},
  ];

  const canvas = createCanvas(980, 520);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f9f9fb'; ctx.fillRect(0,0,980,520);
  ctx.font = `bold 15px ${FONT}`; ctx.fillStyle = '#1a1a2e';
  ctx.fillText('数产集团战略路径时间轴（2026-2030）', 320, 32);

  const axisY = 95;
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(70,axisY); ctx.lineTo(930,axisY); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.moveTo(930,axisY); ctx.lineTo(918,axisY-6); ctx.lineTo(918,axisY+6); ctx.closePath(); ctx.fill();

  const colW = (880-70)/(stages.length-1);
  stages.forEach((stage, i) => {
    const cx = 70 + i*colW, cy = axisY;
    ctx.beginPath(); ctx.arc(cx,cy,12,0,Math.PI*2);
    ctx.fillStyle = stage.color; ctx.fill();
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.font = `bold 13px ${FONT}`; ctx.fillStyle = stage.color;
    ctx.textAlign = 'center'; ctx.fillText(stage.year, cx, cy-20); ctx.textAlign = 'left';

    const cardX = cx-82, cardY = cy+25, cardW = 164, cardH = 360;
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.08)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
    ctx.beginPath(); ctx.roundRect(cardX, cardY, cardW, cardH, 6); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = stage.color;
    ctx.beginPath(); ctx.roundRect(cardX, cardY, cardW, 6, [6,6,0,0]); ctx.fill();

    stage.items.forEach((m, j) => {
      const itemY = cardY+20+j*112;
      ctx.font = `9px ${FONT}`; ctx.fillStyle = 'rgba(100,100,100,0.7)'; ctx.textAlign='center';
      ctx.fillText(m.label, cardX+cardW/2, itemY+8);
      ctx.font = `bold 11px ${FONT}`; ctx.fillStyle = '#1a1a2e';
      ctx.fillText(m.value, cardX+cardW/2, itemY+28);
      ctx.font = `9px ${FONT}`; ctx.fillStyle = stage.color;
      ctx.fillText(m.sub, cardX+cardW/2, itemY+46);
    });

    ctx.setLineDash([3,3]); ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx,cy+12); ctx.lineTo(cx,cardY); ctx.stroke(); ctx.setLineDash([]);
  });

  const buf = canvas.toBuffer('image/png');
  const fp = path.join(OUT_DIR, 'chart_timeline.png');
  fs.writeFileSync(fp, buf);
  console.log(`✅ chart_timeline.png (${Math.round(buf.length/1024)}KB)`);
}

// ─── 执行 ─────────────────────────────────────────
console.log('\n开始生成5张图表...\n');
chart1();
chart2();
chart3();
chart4();
chart5();
console.log(`\n全部完成！输出目录: ${OUT_DIR}`);
