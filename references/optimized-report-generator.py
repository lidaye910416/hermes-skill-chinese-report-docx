#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Markdown → 中国公文格式 Word 文档生成器
来源：chinese-report-docx skill — 精炼版（实测通过）
用法：python3 references/optimized-report-generator.py

依赖：pip3 install python-docx
验证：open -a "wpsoffice" output.docx
"""
from docx import Document
from docx.shared import Pt, Cm, Inches
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.text import WD_ALIGN_PARAGRAPH
import re, os

# ─── 全角化 ───────────────────────────────────────────────────────────────
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
        elif c == '\u201c': result.append('\u201c')   # 左双引号 → 左双引号
        elif c == '\u201d': result.append('\u201d')   # 右双引号 → 右双引号
        elif c == '"':                                  # ASCII双引号 → 交替左右
            result.append('\u201c' if qtoggle else '\u201d')
            qtoggle = not qtoggle
        elif c == '"': result.append('\u201c')   # ASCII左双引号（另一编码）→ 左双引号
        elif c == "'": result.append('\u2019')   # 中文右单引号
        elif c == "'": result.append('\u2018')   # 中文左单引号
        elif c == '`': result.append('\u2018')   # ASCII反引号 → 中文左单引号
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

# ─── 字体设置（三个属性全设）──────────────────────────────────────────────
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

# ─── 段落格式 ────────────────────────────────────────────────────────────
def set_spacing(p, line=500, exact=True):
    """段间距。line=500即25磅（1pt=20twips），exact=True时为固定值"""
    pPr = p._element.get_or_add_pPr()
    sp = pPr.find(qn('w:spacing'))
    if sp is None:
        sp = OxmlElement('w:spacing')
        pPr.append(sp)
    sp.set(qn('w:line'), str(line))
    sp.set(qn('w:lineRule'), 'exact' if exact else 'auto')

def set_indent(p, chars=2):            # 首行缩进两字符
    pPr = p._element.get_or_add_pPr()
    ind = pPr.find(qn('w:ind'))
    if ind is None:
        ind = OxmlElement('w:ind')
        pPr.append(ind)
    ind.set(qn('w:firstLineChars'), str(chars * 100))

# ─── 图片插入 ─────────────────────────────────────────────────────────────
def add_image(doc, image_path, width=Inches(5.5)):
    doc.add_picture(image_path, width=width)
    last_para = doc.paragraphs[-1]
    last_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_spacing(last_para, line=240)

# ─── 核心生成函数 ────────────────────────────────────────────────────────
def build_doc(md_path, image_dir, output_path,
              title_font='方正公文小标宋',
              h2_font='黑体',
              h3_font='楷体_GB2312',
              body_font='仿宋_GB2312'):
    doc = Document()
    for section in doc.sections:
        section.top_margin    = Cm(2.54)
        section.bottom_margin = Cm(2.54)
        section.left_margin   = Cm(2.54)
        section.right_margin  = Cm(2.54)

    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # ⚠️ 步骤1：主标题必须在循环前单独处理（否则被 lines[1:] 跳过）
    first = lines[0].strip()
    if re.match(r'^# (.+)$', first):
        title_text = fullwidth(re.match(r'^# (.+)$', first).group(1))
        p = doc.add_paragraph()
        run = p.add_run(title_text)
        set_font(run, title_font, 22, bold=False)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_spacing(p, line=500)

    content_lines = lines[1:]   # 正文从第2行开始

    for line in content_lines:
        ls  = line.rstrip('\n')
        lst = ls.strip()

        # 分隔线
        if re.match(r'^---+$', lst):
            continue

        # 图片
        img_m = re.match(r'^!\[([^\]]*)\]\(([^)]+)\)$', lst)
        if img_m:
            img_path = os.path.join(image_dir, img_m.group(2))
            if os.path.exists(img_path):
                add_image(doc, img_path)
            continue

        # 二级标题 ## 章节名（跳过摘要、引言、结语，内容在其后紧跟的段落中）
        h2_m = re.match(r'^## (.+)$', lst)
        if h2_m and lst in ('## 摘要', '## 引言', '## 结语'):
            continue
        if h2_m:
            p = doc.add_paragraph()
            run = p.add_run(fullwidth(h2_m.group(1)))
            set_font(run, h2_font, 16, bold=False)
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            set_indent(p, chars=2)
            set_spacing(p, line=500)
            continue

        # 三级标题 ### 小节（加粗，加缩进）
        h3_m = re.match(r'^### (.+)$', lst)
        if h3_m:
            p = doc.add_paragraph()
            run = p.add_run(fullwidth(h3_m.group(1)))
            set_font(run, h3_font, 16, bold=True)
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            set_indent(p, chars=2)
            set_spacing(p, line=500)
            continue

        # 日期行（如 *报告编制日期：2026年5月*）
        if re.match(r'^\*报告编制日期', lst):
            p = doc.add_paragraph()
            run = p.add_run(fullwidth(lst.strip('* ')))
            set_font(run, body_font, 16, bold=False)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            set_spacing(p, line=500)
            continue

        # 脚注（如 *注：...*）
        if re.match(r'^\*注：', lst):
            p = doc.add_paragraph()
            run = p.add_run(fullwidth(lst.strip('* ')))
            set_font(run, body_font, 14, bold=False)
            set_spacing(p, line=240)
            continue

        # **bold** 独立小标题行（如 **引言**、**结语**）→ 加粗正文段落，不缩进
        bold_m = re.match(r'^\*\*(.+)\*\*$', lst)
        if bold_m:
            p = doc.add_paragraph()
            run = p.add_run(fullwidth(bold_m.group(1)))
            set_font(run, body_font, 16, bold=True)
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            set_spacing(p, line=500)
            continue

        # 空行：直接跳过，不生成空白段落（否则每个空行多一个空段落，撑开间距）
        if not lst:
            continue

        # 正文段落
        p = doc.add_paragraph()
        run = p.add_run(fullwidth(lst))
        set_font(run, body_font, 16, bold=False)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        set_indent(p, chars=2)
        set_spacing(p, line=500)

    doc.save(output_path)
    print(f'✅ 已生成：{output_path}')

# ─── 入口 ─────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    import sys
    md_path     = sys.argv[1] if len(sys.argv) > 1 else 'report.md'
    image_dir   = sys.argv[2] if len(sys.argv) > 2 else './imgs'
    output_path = sys.argv[3] if len(sys.argv) > 3 else 'output.docx'
    build_doc(md_path, image_dir, output_path)
