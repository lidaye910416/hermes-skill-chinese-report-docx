---
name: chinese-report-docx
description: "从 Markdown 生成中国公文/研究报告格式的 Word 文档。触发条件：生成 Word 文档、生成研究报告 docx、中文 Word 排版、公文格式转换。"
version: 1.5.0
author: Hermes Agent
license: MIT
dependencies: []
metadata:
  hermes:
    tags: [Word, docx, 中文排版, 公文格式, 研究报告]
    related_skills: [docx-reader]
---

# Chinese Report Docx Generator

生成中国公文/研究报告格式的 Word 文档。**技术实现依托 `docx-reader` skill**，本 skill 仅记录 jasonlee 的格式偏好。

## 格式参考（实测依据）

本 skill 格式规范基于数产集团公文模板实测确定（参考文件：`0529数产集团 2026 年上半年工作总结及下半年工作计划_v2.docx`）。实测参数与早期版本存在多处差异，以本节为准。

### 实测格式参数

| 元素 | 字体（WOFF） | 字号 | 加粗 | 对齐 | 行距 |
|------|-------------|------|------|------|------|
| 主标题 | 方正公文小标宋 | 二号(22pt) | 否 | **居中** | 固定值25磅(500twips, exact) |
| 二级标题（如"一、上半年经营情况"） | 黑体 | 三号(16pt) | **否** | 左对齐，首行缩进两字符 | 固定值25磅(500twips, exact) |
| 三级标题（如"（一）经营指标完成情况"） | 楷体_GB2312 | 三号(16pt) | **是** | 左对齐，首行缩进两字符 | 固定值25磅(500twips, exact) |
| 正文 | 仿宋_GB2312 | 三号(16pt) | 否 | **两端对齐 + 首行缩进两字符** | 固定值25磅(500twips, exact) |

### 行距说明

- `w:line="500" w:lineRule="exact"` 即 25 磅固定值（1pt=20twips，25pt×20=500）
- `set_spacing(p, line=500, exact=True)` 生成此格式
- 与旧版 1.5 倍行距(360, auto) 不同，公文模板要求固定值段间距

### 与旧版差异摘要

| 项目 | 旧版值 | 实测新版值 |
|------|--------|-----------|
| 主标题字体 | 方正小标宋简体 | 方正公文小标宋 |
| 主标题对齐 | 左对齐 | **居中** |
| 三级标题字体 | 仿宋_GB2312 | **楷体_GB2312** |
| 行距 | 360(auto) 1.5倍 | 500(exact) 固定25磅 |

---

## jasonlee 格式偏好（必须严格遵守）

| 元素 | 字体 | 字号 | 加粗 | 对齐 | 行距 |
|------|------|------|------|------|------|
| 主标题 | 方正公文小标宋 | 二号(22pt) | 否 | **居中** | 固定值25磅(500twips, exact) |
| 二级标题（如"一、上半年经营情况"） | 黑体 | 三号(16pt) | **否** | 左对齐，首行缩进两字符 | 固定值25磅(500twips, exact) |
| 三级标题（如"（一）经营指标完成情况"） | 楷体_GB2312 | 三号(16pt) | **是** | 左对齐，首行缩进两字符 | 固定值25磅(500twips, exact) |
| 正文 | 仿宋_GB2312 | 三号(16pt) | 否 | **两端对齐 + 首行缩进两字符** | 固定值25磅(500twips, exact) |

### 行距说明（固定值 vs 1.5倍）

政府公文使用 `line=500`（固定值500 twips），不是 `line=360`（1.5倍行距的自动值）。两者视觉差异显著——固定值500更宽松，正式公文文件均用此设置。

### 标点符号规则

- **小数点** `.` 前后都是数字 → 保留（如 `6.7`、`123.4`）
- **列表编号** `.` 前数字+后空格 → 转为 `。`（如 `1. 政治` → `1。 政治`）
- **千分位逗号** `,` 前后都是数字 → 直接删除（如 `1,234` → `1234`）
- **双引号** `"` → 交替转为 `""`（中文弯引号，奇数→左，偶数→右）
- **其余标点** → 全角化

> 完整标点转换规则表、测试用例、踩坑记录：见 `docx-reader/references/docx-fullwidth.md`
>
> **可运行的参考脚本**（实测通过）：`references/optimized-report-generator.py`
> **数产集团公文格式实测参考**：`references/shouchan-format-reference.md`（2026年5月，从真实公文提取的格式规范 + 验证方法）
>
> **PDF 财务数据提取避坑**：从 PDF 更新报告数据时，必须做交叉验证。详见 `references/pdf-financial-extract.md`（含收入口径陷阱、研发费用率反推验证方法、数产本部vs合并口径辨析）

## 工作流程

### Step 1：优先使用参考脚本

直接复制 `references/optimized-report-generator.py` 到 `/tmp/` 或项目目录，按需修改 md_path、image_dir、output_path 参数，比从 SKILL.md 重新拼装更可靠。

```bash
# 依赖
pip3 install python-docx

# 执行
python3 /path/to/optimized-report-generator.py input.md ./imgs output.docx
```

**⚠️ Output 路径陷阱**：脚本总是输出到**当前工作目录**（cwd），不是 `output_path` 参数指定的目录。脚本最后打印 `✅ 已生成：output_path` 但文件实际在 cwd。

**正确流程**：
```bash
# Step 1：先 cd 到期望的输出目录
cd /Users/jasonlee/Downloads

# Step 2：然后执行脚本（output_path 写文件名即可）
python3 /Users/jasonlee/.hermes/skills/productivity/chinese-report-docx/references/optimized-report-generator.py \
    /tmp/report.md ./imgs "最终文件名.docx"

# Step 3：确认文件
ls -lh 最终文件名.docx
```

**错误的做法**：
```bash
# ❌ output_path 写绝对路径也无效（因为脚本内部 doc.save() 是相对路径）
python3 ... /tmp/report.md ./imgs "/Users/jasonlee/Downloads/最终文件名.docx"
# 实际输出在 cwd，而不是 /Users/jasonlee/Downloads/
```

### Step 2：手动编写（如需定制）

必须先 `write_file` 生成 Python 脚本（不要用 heredoc）。`fullwidth()` 直接从 `docx-reader/references/docx-fullwidth.md` 复制，或使用以下简化版：

```python
def fullwidth(text):
    if not text: return text
    result, i, qtoggle = [], 0, True
    while i < len(text):
        c = text[i]
        if c == '.':
            before = i > 0 and text[i-1].isdigit()
            after  = i+1 < len(text) and text[i+1].isdigit()
            after_space = i+1 < len(text) and text[i+1].isspace()
            result.append('.' if (before and (after or not after_space)) else '。')
        elif c == ',':
            before = i > 0 and text[i-1].isdigit()
            after  = i+1 < len(text) and text[i+1].isdigit()
            result.append('，' if not (before and after) else '')
        elif c == ':': result.append('：')
        elif c == ';': result.append('；')
        # ✅ 用 \uXXXX 转义序列写入条件，patch 工具不会破坏 Unicode 语义
        elif c == '\u201c': result.append('\u201c')   # 左双引 → 左双引
        elif c == '\u201d': result.append('\u201d')   # 右双引 → 右双引
        elif c == '"':                                  # ASCII双引号 → 交替左右
            result.append('\u201c' if qtoggle else '\u201d')
            qtoggle = not qtoggle
        elif c == '\u2018': result.append('\u2018')   # 左单引 → 左单引
        elif c == '\u2019': result.append('\u2019')   # 右单引 → 右单引
        elif c == '`': result.append('\u2018')  # 反引 → 左单引
        elif c == '(': result.append('（')
        elif c == ')': result.append('）')
        elif c == '-': result.append('——')
        elif c == '+': result.append('＋')
        elif c == '%': result.append('％')
        elif c == '&': result.append('＆')
        elif c == '/': result.append('／')
        elif c == '<': result.append('＜')
        elif c == '>': result.append('＞')
        else: result.append(c)
        i += 1
    return ''.join(result)
```

字体设置（**三个属性全设**，不要只设 `w:eastAsia`）：

```python
def set_font(run, fname, size, bold=False):
    run.font.name = fname
    run.font.size = Pt(size)
    run.font.bold = bold
    r = run._r
    rPr = r.get_or_add_rPr()
    rF = rPr.find(qn('w:rFonts'))
    if rF is None:
        rF = OxmlElement('w:rFonts')
        rPr.insert(0, rF)
    rF.set(qn('w:ascii'), fname)
    rF.set(qn('w:hAnsi'), fname)
    rF.set(qn('w:eastAsia'), fname)
```

段落处理：

```python
def set_spacing(p, line=360):
    pPr = p._element.get_or_add_pPr()
    sp = pPr.find(qn('w:spacing'))
    if sp is None:
        sp = OxmlElement('w:spacing')
        pPr.append(sp)
    sp.set(qn('w:line'), str(line))
    sp.set(qn('w:lineRule'), 'auto')

def set_indent(p, chars=2):
    pPr = p._element.get_or_add_pPr()
    ind = pPr.find(qn('w:ind'))
    if ind is None:
        ind = OxmlElement('w:ind')
        pPr.append(ind)
    ind.set(qn('w:firstLineChars'), str(chars * 100))
```

### Step 2：执行脚本

```bash
python3 /tmp/generate_chinese_report.py
```

### Step 3：用 WPS 打开验证

```bash
open -a "wpsoffice" "/path/to/output.docx"
```

## Word 文档中嵌入图片

```python
from docx import Document
from docx.shared import Pt, Cm, Inches

def add_image_paragraph(doc, img_path, width=Cm(14)):
    """在段落中央添加图片"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run()
    run.add_picture(img_path, width=width)
    return p

# 检查文档中的图片数量
imgs = doc.element.body.findall(
    './/{http://schemas.openxmlformats.org/wordprocessingml/2006/main}drawing')
print(f"图片数: {len(imgs)}")
```

**注意**：
- 图片占位符语法 `![名称](图片.png)` 在 Word 中无效，必须用 `run.add_picture()` 实际嵌入
- 图片路径用绝对路径或相对于文档保存目录的路径
- 建议宽度 Cm(14)（约14厘米，适合A4页面）

---

## 图表生成：Chart.js + canvas（优先方案）

**Chart.js + canvas (Node.js) 质量远优于 Mermaid**，渲染速度快、样式可控、中文字体支持好。

### 图表字体大小规范（必读 pitfall）

**图表字体必须比预期更大**。用户在 v3 版本明确反馈图表文字太小、不适合阅读。以后生成图表必须遵守以下字号底线：

| 元素 | 最小字号 | 推荐字号 |
|------|---------|---------|
| 图表标题 | 16pt | **18pt** |
| 图例/副标题 | 12pt | **14pt** |
| 坐标轴标签/刻度 | 11pt | **12pt** |
| 辅助说明文字 | 10pt | **11pt** |

**实测教训**：v1 图表用 title 15pt/legend 11pt/tick 10pt → 用户反馈"文字非常小，不适合阅读"。v2 统一放大2pt后改善。

### patch 工具破坏 Unicode 转义序列（最关键）

用 `skill_manage patch` 修补含 Unicode 字符的 Python 代码时，`"\u201c"`（中文左双引）可能被 patch 工具解析为 ASCII `"`。症状：`fullwidth()` 转换后英文引号仍残留 Word 中。

**验证方法**：
```python
from your_module import fullwidth
print(fullwidth('"test"'))   # 应输出 '"test"'（中文弯引）
```

**根本解决（已实施）**：在 old_string / new_string 中用转义序列 `\u201c` / `\u201d` 表示引号字符。`optimized-report-generator.py` 源码中已用此方法写入条件分支，patch 工具不会错误解析。

### `roundRect` 函数作用域 pitfall（chart-gen-nodejs.js）

`roundRect` 函数如果定义在某个 `chartN()` 函数内部（局部函数），则其他 chart 函数无法调用。症状：
```
ReferenceError: roundRect is not defined
    at chart5 (/tmp/chart_gen/gen_charts_v2.js:595:5)
```
**解决**：将 `roundRect` 定义为全局函数，放在所有 chart 函数之前；或在 chart5 中使用原生 Canvas API `ctx.roundRect()`。
**解决**：将 `roundRect` 定义为全局函数，放在所有 chart 函数之前；或在 chart5 中使用原生 Canvas API `ctx.roundRect()`（Node.js canvas 支持此 API）。

```javascript
// ✅ 全局定义（在所有 chartN 函数之前）
function roundRect(ctx, x, y, w, h, r) { ... }

// ✅ 或在需要的地方用原生 API
ctx.beginPath();
ctx.roundRect(x, y, w, h, 7);
ctx.fill();
```

### 快速生成5张图表的 Node.js 脚本

依赖安装：
```bash
mkdir -p /tmp/chart_gen && cd /tmp/chart_gen
npm install chart.js canvas  # ~50秒
```

字体注册（macOS）：
```javascript
const { registerFont } = require('canvas');
registerFont('/System/Library/Fonts/STHeiti Light.ttc', { family: 'STHeiti Light', weight: '300' });
registerFont('/System/Library/Fonts/STHeiti Medium.ttc', { family: 'STHeiti', weight: 'normal' });
registerFont('/System/Library/Fonts/Hiragino Sans GB.ttc', { family: 'Hiragino Sans GB', weight: 'normal' });
registerFont('/System/Library/Fonts/Supplemental/Songti.ttc', { family: 'Songti SC', weight: 'normal' });
```

图表输出：`createCanvas(w, h)` → `chart.toBuffer('image/png')`

完整示例脚本见：`references/chart-gen-nodejs.js`

### Mermaid 图表渲染（备选方案）

在 Mac/Linux 上用 Docker 渲染 Mermaid 图表：

```bash
# 1. 创建工作目录
mkdir -p /tmp/mermaid_charts

# 2. 写入 .mmd 文件
cat > /tmp/mermaid_charts/my_chart.mmd << 'EOF'
pie title 示例
    "A" : 40
    "B" : 60
EOF

# 3. Docker 渲染（需 DOCKER_CONFIG=/tmp 绕过 credential store 问题）
DOCKER_CONFIG=/tmp docker run --rm \
  -v /tmp/mermaid_charts:/data \
  minlag/mermaid-cli \
  -i /data/my_chart.mmd -o /data/my_chart.png

# 4. 移动到目标位置
mv /tmp/mermaid_charts/my_chart.png /path/to/output/
```

**Mermaid 类型兼容性（minlag/mermaid-cli）**：
- ✅ 支持：`pie`, `flowchart`, `xychart-beta`, `timeline`, `gantt`
- ❌ 不支持：`quadrantChart`（改用 `flowchart TD` 替代）
- ❌ 不支持：`bar`（改用 `pie` 替代）

**完整流程**：Mermaid源码 → 渲染PNG → 嵌入Word文档

---

## 已有报告的数据更新工作流

当需要更新已有 Word 文档中的部分数据（如财务数据口径切换：合并报表→本部报表），而非从零生成时，推荐以下流程：

### Step 1：从 PDF 提取目标数据

用 pymupdf（fitz）提取 PDF 中的结构化数据，保存为对照表。注意：
- `execute_code` 环境的 sys.path 不含 fitz/pymupdf，需用 `terminal("python3 -c '...'")` 执行
- 数产集团存在"合并报表"与"本部报表"口径差异，PDF 中通常只有本部数据

### Step 2：已有 Markdown 精确重写（优于正则替换）

将原 Word 转 markdown → 识别需替换的章节 → **完全重写**该章节 markdown → 合并回主文件。

**禁止依赖正则替换已有 markdown**（如 `re.sub(r'原数据', '新数据', content)`），原因：
- Markdown 语法元素（`**bold**`、`###` 标题、`|表格|`）与正文内容混合时，正则会误匹配或漏匹配
- 本次实坑：章节标记 `**1. 输入价格对比**` 与内联加粗 `**负面**` 混用，导致小标题被截断

正确做法：
```python
# 完全重写需要更新的章节，而不是做字符串替换
with open('/tmp/full_report.md') as f:
    lines = f.readlines()

# 找到目标章节的起止行，重新构建
new_lines = []
for line in lines:
    if line.startswith('## 二、') and '对标分析' in line:
        new_lines.extend(new_chapter_content)  # 插入 DeerFlow 输出的新内容
    else:
        new_lines.append(line)

with open('/tmp/updated_report.md', 'w') as f:
    f.writelines(new_lines)
```

### Step 3：联动更新全文档数据引用

口径切换后，全文引用旧数据的段落（如"规模差距14倍"→"规模差距29.9倍"）也需手动更新：
- 用 `re.sub` 逐行处理，**跳过标题行**（`#` 开头）和加粗行（`**` 包裹）
- 数字替换用精确字符串而非模糊匹配，避免把页码、日期也替换

### Step 4：生成 Word

```bash
python3 /Users/jasonlee/.hermes/skills/productivity/chinese-report-docx/references/optimized-report-generator.py \
    /tmp/updated_report.md ./imgs "/Users/jasonlee/Desktop/报告_更新版.docx"
```

---

## 禁止事项

1. **不要用 macOS 替代字体** —— 直接指定 STSong/Songti SC/Heiti SC 会导致 WPS 乱码，用原始中文名
2. **不要只设 `w:eastAsia`** —— 三个属性必须全设
3. **不要直接 replace XML bytes** —— 用 lxml 只改 `<w:t>` text 属性
4. **不要用简单 `str.replace('.', '。')`** —— 会误杀小数点
5. **不要保留千分位逗号** —— `1,234` → `1234`
- **不要把 `"` 写成英文直引号** —— 必须转为 `""`

## 引号转换规则（含踩坑记录）

> ⚠️ 完整根因分析 + 验证用例见 `references/fullwidth-quote-fix.md`

**关键规则**：
1. Markdown 源文件中的 ASCII 双引号 ` "`（U+0022）无法区分左右 → 用 `qtoggle` 交替转为 U+201C（左）/ U+201D（右）
2. 源码中两个 `elif c == '"'` 分支**不能**都写 `c == '"'`，必须用 Unicode 码点 `\u201c`/`\u201d` 区分条件
3. patch 工具不会破坏 Unicode 转义序列 `\u201c`/`\u201d`，但会把视觉 Unicode 字符字面量转成 ASCII，条件判断时**必须用转义序列**，不能用视觉字符

## 政府公文政策报告的结构规范（2026-05 v10 实测确立）

> **参考文件**：`references/libo-bowen-proposal-template.md` — 李博闻提案完整 Markdown 结构 + 引言四要素 + v9/v10/v10 对照表。生成政府提案类报告时优先阅读此文件。

生成面向政府部门的政策报告时（如政协/人大提案、产业建议），内容结构必须对齐同类政府提案模板（如李博闻提案），不只是格式对齐。

### 标准封面结构

```
关于XXX的建议（无编号标题）
推动武汉XXX产业发展的政策建议（副标题，无编号）
九三学社武汉市委员会（落款）
2025年10月（日期）
[正文]
执笔人：xxx
```

**v9 vs v10 核心差距**：v9 缺失落款/日期/执笔人，导致"不像政府提案"。v10 补全后通过审查。

### 正文三段结构

```
一、存在的主要问题
  （一）在XXX方面（用"一是…二是…"口吻，说武汉实际痛点）
  （二）在XXX方面
  （三）在XXX方面
二、建议
  （一）将XXX纳入XXX（每条明确提具体机构名称）
  （二）配套XXX
  （三）建设XXX产学研平台（提东湖高新区等具体园区）
  （四）完善XXX人才培养机制
  （五）构建XXX产业生态
**结语**（加粗正文段，不是标题）
```

### 问题章节写作要点

- **口吻平实**：用"一是在XXX方面…二是…"而不是"XXX是内存墙瓶颈"等抽象概念
- **说武汉痛点**：重复建设、验证平台空白、产学研脱节、数据集落后——具体可感知的弱点
- **技术事实归建议章节**：Cerebras/TurboQuant/Chiplet等技术参数放建议章节作支撑，不在问题章节自述
- **禁止空洞分析**："内存墙瓶颈"/"架构创新"等大词只放建议章节，问题章节只说武汉"缺乏"/"不足"/"尚未形成"

### 建议章节写作要点

- **每条有具体机构**：武汉大学、华中科技大学、武汉理工大学、长江存储、光迅科技、华工科技、东湖高新区——有名字才可信
- **技术内容融进去**：如"晶圆级封装（如Cerebras WSE系列，内存带宽21.5TB/s）"作为背景说清楚
- **语气坚定**："应当"/"必须"/"加快"，不用"建议"/"可以"/"可考虑"

### 引言必须有的四类信息

1. **宏观背景**（1-2句）："数字经济正成为…/国家层面在'十四五'期间明确提出…"
2. **武汉具体事实**（核心，要有数字）："武汉算力公共服务平台2024年7月上线一期，截至2025年2月已汇聚通算165万核、智算7909P、超算86P等资源"
3. **技术新浪潮**（1-2句）："以存算一体（Computing-in-Memory）为核心的技术新浪潮正在重塑全球AI芯片竞争格局"
4. **武汉优势锚定**（收尾）："武汉市若能立足自身光电融合优势…有望在新赛道上实现换道领跑"

### 技术内容的正确归位

| 技术内容 | 正确位置 | 错误位置 |
|---------|---------|---------|
| 存算一体 28nm达7nm性能 | 建议章节（一）背景支撑 | 问题章节空洞分析 |
| Cerebras WSE内存带宽21.5TB/s | 建议章节（二）封装工艺背景 | 独立成节 |
| Chiplet AMD MI300X验证 | 建议章节（二） | 独立成节 |
| TurboQuant 6倍压缩8倍加速 | 建议章节（五）算法协同 | 独立成节 |
| 类脑/神经形态计算 | 建议章节一笔带过 | 独立成节 |

### 对比：李博闻模板 vs v9 vs v10

| 维度 | 李博闻模板 | v9 | v10 |
|------|-----------|-----|-----|
| 引言数字 | 165万核/7909P/86P | 无具体数字 | 165万核/7909P/86P ✓ |
| 问题口吻 | "一是…二是…"平实 | "内存墙瓶颈"抽象 | "一是…二是…"平实 ✓ |
| 建议主体 | 武汉大学/华科/长江存储/光迅科技 | 无具体机构 | 全都有 ✓ |
| 技术定位 | 技术事实→建议章节支撑 | 技术放问题章节空洞分析 | 归位正确 ✓ |
| 落款/执笔人 | 有 | 无 | 有 ✓ |
| 字数 | ~2000+ | 1817 | 2547 ✓ |

## 政府公文类报告的 Markdown 源要求

DeerFlow 输出的 Markdown 在喂入 Word 生成器之前，需满足以下格式规范，否则脚本无法正确处理：

### 标题层级

```
# 主标题（方正小标宋，22pt，**左对齐**）
## 二、章节名（黑体，16pt，左对齐）  ← 注意：一级用 ## 不是 #
### （一）小节名（仿宋，16pt，加粗，左对齐）
```

### 引言/结语的处理

Markdown 中用 `**引言**`、`**结语**` 作为加粗正文段（不是 `##` 标题）：

```markdown
## 二、武汉产业发展现状...

### （一）...

[正文段落]

**引言**

[引言内容，直接跟在上文后，不换段]

### （二）...

**结语**
[结语内容]
```

脚本会把 `**引言**` 渲染为加粗正文（16pt，左对齐，无缩进），把 `## 引言` 跳过让正文自然承接。

### `###` 三级标题 vs `**bold**` 的正确使用（重要）

脚本对标题的处理逻辑：

| Markdown 语法 | 识别为 | 渲染效果 |
|---|---|---|
| `# 主标题` | h1（循环前单独处理） | 方正小标宋，22pt，**左对齐** |
| `## 二、章节名` | h2 | 黑体，16pt，左对齐 |
| `### （一）xxx` | h3 | 仿宋，16pt，加粗，左对齐 |
| `**xxx**`（独立行） | bold 正文段 | 仿宋，16pt，加粗，左对齐，**无缩进** |
| `**引言**`、`**结语**` | bold 正文段（特殊） | 同上 |

**常见错误**：在 Markdown 源中使用 `**（一）xxx**` 作为小节标题，脚本会将其识别为加粗正文段而非三级标题，导致：
- 输出 Word 中残留 `**` 字面量
- 字号/字体不统一

**正确做法**：小节标题统一用 `###` 语法，不要用 `**bold**` 包裹：
```markdown
# 关于支持人工智能模型、核心芯片技术攻关的建议

当前...（引言）

## 一、存在的主要问题

### （一）软硬件产业面临新技术路线颠覆风险

[正文段落...]

### （二）核心技术攻关合力尚未形成

[正文段落...]

**结语**

[结语段落...]
```

### 必须主动清理的 Markdown 残留
### 必须主动清理的 Markdown 残留

在调用 Word 生成器之前，用 patch 或 sed 清理：

```python
content = re.sub(r'\*\*摘要\*\*', '摘要', content)
content = re.sub(r'\*\*引言\*\*', '引言', content)
content = re.sub(r'\*\*结语\*\*', '结语', content)
```

### 政府公文语言审查（必须执行）

生成面向政府部门的报告时，**必须**调用 DeerFlow 形式审查员（见 deer-flow skill：`references/policy-report-formal-review.md`）。审查清单：

- 无"待核实"、"（待核实）"
- 无"有待进一步"
- 无"有望"、"或将"、"可能"
- 政策建议用"应"、"必须"、"给予"，不用"可考虑"
- 数据不确定时：删数字改定性，不留"待核实"

## 踩坑记录（实测教训）

### 主标题被 lines[1:] 跳过的陷阱

常见错误写法：
```
with open(md_path) as f:
    lines = f.readlines()
content_lines = lines[1:]  # 第一行 # 主标题被跳过！
for line in content_lines:
    h1_m = re.match(r'^# (.+)', ...)  # 永远匹配不到
```

正确做法：主标题必须在循环前单独处理，content_lines 从第二行开始：
```
first = lines[0].strip()
if re.match(r'^# (.+)$', first):
    title_text = fullwidth(re.match(r'^# (.+)$', first).group(1))
    p = doc.add_paragraph()
    run = p.add_run(title_text)
    set_font(run, '方正小标宋简体', 22, bold=False)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

content_lines = lines[1:]  # 正文从这里开始
```

### 日期行对齐错写成 LEFT

日期行（*报告编制日期：2026年5月*）应居中，不是左对齐：
```
p.alignment = WD_ALIGN_PARAGRAPH.CENTER  # 不是 LEFT
```

### 循环内重复处理 h1

主标题提到循环前处理后，循环内仍写 if h1_match 会导致 ## 摘要这样的二级标题也被误判。确保循环内只处理 h2/h3。

### 空行不要生成空白段落

正确写法（空行直接跳过）：

### 正文缩进不要写在标题上

三级标题（`### 1.1`）是加粗标题，不是正文段落，不要加首行缩进。只在非标题的正文段落调用 `set_indent(p, chars=2)`。

### **bold** Markdown 作为内嵌小标题的识别

如果 Markdown 源用 `**text**` 作为独立小标题行（如 `**达梦数据：产品技术驱动型企业的盈利能力范本**`），需要在正文处理前先识别并转为独立加粗段落：

```python
# **bold** 内嵌小标题 → 加粗正文段落（不缩进）
bold_match = re.match(r'^\*\*(.+)\*\*$', line_stripped)
if bold_match:
    title_text = fullwidth(bold_match.group(1))
    p = doc.add_paragraph()
    run = p.add_run(title_text)
    set_font(run, FANGSONG, 16, bold=True)
    para_left(p)          # 标题左对齐，不缩进
    set_spacing(p, line=360)
    continue
```

### 正文段落中行内残留 **bold** 标记要清理

正文段落（非独立标题行）中如果还有 `**text**` 残留的 Markdown 加粗标记，要用正则去掉：

```python
fw_text = re.sub(r'\*\*(.+?)\*\*', r'\1', fw_text)
```

### Bold标记残留导致Word中残留`**`

DeerFlow 等 LLM 生成 Markdown 时，章节标签（如 `**引言**`、`**结语**`、`**摘要**`）会原样输出 `**` 字符。`optimized-report-generator.py` 的 `fullwidth()` 函数不处理星号，导致 Word 文档中残留 `**`。

**症状**：Word 中可见"**引言**"而非干净的"引言"

**解决**：在喂入生成器前清理：
```python
content = content.replace('**引言**', '引言')
content = content.replace('**结语**', '结语')
content = content.replace('**摘要**', '摘要')
content = re.sub(r'\*\*(.+?)\*\*', r'\1', content)  # 处理孤立bold行
```

**主动预防**：深化合并 Prompt 中加"输出时不要用加粗标记包裹章节标签"

### 空行不要生成空白段落

正确写法（空行直接跳过，不要调用 `doc.add_paragraph()`）：

```python
# ✅ 正确
if not lst:
    continue

# ❌ 错误（每个空行多一个空段落，段落数翻倍，间距杂乱）
if not lst:
    p = doc.add_paragraph()
    set_spacing(p, line=240)
    continue
```

### **`## 引言` / `## 结语` 被当作 h2 黑体标题**

Markdown 中 `## 引言` 和 `## 结语` 是章节标记，不应渲染为黑体标题。其后的内容（如 `**引言**` 加粗正文段落）会紧跟在前一段落后自然衔接。

```python
# ✅ 正确：跳过这两个特定 h2
if h2_m and lst in ('## 摘要', '## 引言', '## 结语'):
    continue
if h2_m:  # 其他 ## 标题正常渲染为黑体
    ...

# ❌ 错误：只跳过 ## 摘要，导致 ## 引言 被渲染为黑体标题
if h2_m and lst == '## 摘要':
    continue
```

### **`**bold**` 独立行残留为 `**` 字面量**

需要在正文处理前识别并转为加粗正文段落：

```python
# ✅ 正确：在空行处理之前，先匹配 **bold** 独立行
bold_m = re.match(r'^\*\*(.+)\*\*$', lst)
if bold_m:
    p = doc.add_paragraph()
    run = p.add_run(fullwidth(bold_m.group(1)))
    set_font(run, body_font, 16, bold=True)
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    set_spacing(p, line=360)
    continue

# 空行
if not lst:
    continue
```

**主动预防**：在 DeerFlow Prompt 中加"输出时不要用加粗标记包裹章节标签"，可以从源头避免此问题。

## 验证清单

- [ ] 中文字符数 > 1000
- [ ] 小数 `6.7`、`9.62` 正确保留
- [ ] 列表编号 `1. ` → `1。`
- [ ] 千分位 `1,234` → `1234`
- [ ] ASCII双引号 `""` 在 Word 中交替出现左引号 U+201C 和右引号 U+201D（各 N 个，数目相等或±1）
- [ ] 正文段落对齐为**两端对齐**（非居中、非左对齐）
- [ ] WPS 打开显示正常
