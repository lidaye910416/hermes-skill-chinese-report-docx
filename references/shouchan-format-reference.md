# 数产集团公文格式参考（2026年5月实测）

**来源文件：** `0529数产集团 2026 年上半年工作总结及下半年工作计划_v2.docx`

## 格式规范汇总

| 元素 | 字体 | 字号 | 加粗 | 对齐 | 行距 |
|------|------|------|------|------|------|
| 主标题 | 方正公文小标宋 | 二号(22pt) | 否 | **居中** | 固定值500 |
| 二级标题（章节，如"一、上半年经营情况"） | 黑体 | 三号(16pt) | **是** | 左对齐 | 固定值500 |
| 三级标题（如"（一）经营指标完成情况"） | 楷体_GB2312 | 三号(16pt) | **是** | 左对齐 | 固定值500 |
| 四级小节编号（如"1.压实经营责任"） | 仿宋_GB2312 | 三号(16pt) | **是** | 左对齐，无首行缩进 | 固定值500 |
| 正文 | 仿宋_GB2312 | 三号(16pt) | 否 | **两端对齐 + 首行缩进两字符** | 固定值500 |

## 行距说明

- 固定值500 twips = `line=500` + `lineRule=exact`（政府公文标准）
- 1.5倍行距 = `line=360` + `lineRule=auto`（研究/学术报告用）
- **两者不可混用**：固定值更宽松，正式公文文件统一使用500

## Markdown → Word 对照表

| Markdown 语法 | 渲染为 | 字体 |
|--------------|--------|------|
| `# 主标题` | 主标题段落 | 方正公文小标宋，居中，22pt |
| `## 一、xxx` | 二级章节标题 | 黑体，16pt，加粗 |
| `### （一）xxx` | 三级小节标题 | 楷体_GB2312，16pt，加粗 |
| `1.压实经营责任...`（正文行以数字开头） | 四级条目 | 仿宋_GB2312，16pt，加粗 |
| 正文段落 | 正文段落 | 仿宋_GB2312，16pt，两端对齐+首行缩进 |

## 验证方法

```python
from docx import Document
from docx.oxml.ns import qn

doc = Document('output.docx')
for i, p in enumerate(doc.paragraphs[:10]):
    r = p.runs[0]._r if p.runs else None
    rF = r.find(qn('w:rFonts')) if r is not None else None
    font = rF.get(qn('w:eastAsia')) if rF is not None else '?'
    sz = round(p.runs[0].font.size.pt) if p.runs and p.runs[0].font.size else '?'
    align = str(p.alignment).split('.')[-1].rstrip(')')
    print(f'[{i:2}] {align:8} {font} {sz}pt | {p.text[:40]}')
```

## 四级条目识别规则

以数字+点号开头且不以 Markdown 列表标记（`- `、`* `）开头的行：
```
1.压实经营责任，多措并举降本增效。  → 识别为四级条目（加粗，无缩进）
2.投资稳步推进，产融结合初见成效。  → 同上
```

**注意**：不要将这些行识别为无序列表或普通正文。四级条目要有 `w:line=500` + `bold=True`。