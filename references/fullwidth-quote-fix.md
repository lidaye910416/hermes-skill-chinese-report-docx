# Chinese Report Docx — fullwidth() 引号转换实测结论

> ⚠️ 本文件已根据 2025-05-26 实测再次修正，增加了 ASCII 双引号交替配对逻辑。

## 根因一：两个分支用了同一个 ASCII 字符（U+0022）

`optimized-report-generator.py` 源码中曾写为：

```python
elif c == '"': result.append('\u201d')   # 右双引号
elif c == '"': result.append('\u201c')   # 左双引号
```

两个 `elif` 条件的 `c == '"'` 都是 ASCII 双引号（U+0022）。Python 条件判断只看字符值，不看注释。因此无论输入左引号还是右引号，第二个分支（`\u201c`，左引号）**永远不会执行**，所有引号都变成了右引号。

症状：Word 中 `"数产集团"` 显示为一对右引号 `""数产集团""`。

## 根因二：Markdown 源文件中只有 ASCII 双引号（U+0022）

用户提供的 markdown 文件中，引号全部是 ASCII 双引号 U+0022（无论左引号还是右引号，都用同一字符）。此时无法区分"哪个是左、哪个是右"，必须用**交替 toggle** 逻辑：

- 第 1 个 `"` → 左双引号 U+201C
- 第 2 个 `"` → 右双引号 U+201D
- 第 3 个 `"` → 左双引号 U+201C
- 以此类推……

## 正确写法（已实施）

```python
def fullwidth(text):
    if not text: return text
    result, i, qtoggle = [], 0, True          # ← qtoggle 初始为 True
    while i < len(text):
        c = text[i]
        if c == '.': ...
        # ... 其他规则 ...
        elif c == '\u201c': result.append('\u201c')   # 左双引 → 左双引
        elif c == '\u201d': result.append('\u201d')   # 右双引 → 右双引
        elif c == '"':                                  # ASCII双引 → 交替左右
            result.append('\u201c' if qtoggle else '\u201d')
            qtoggle = not qtoggle
        # ... 其他规则 ...
        else: result.append(c)
        i += 1
    return ''.join(result)
```

**验证通过（2025-05-26）**：
- 左引号 U+201C: 3 个，右引号 U+201D: 3 个
- Word 中 `"专精特新"` 正确显示为「专精特新」

## patch 工具 Unicode 勘误

之前有文档称 patch 工具会把 `\u201c` 转成 ASCII 双引号，经实测此说不成立：

- patch 工具的 old_string / new_string 精确匹配一行文本
- `elif c == '\u201c':` 和 `elif c == '\u201d':` 是**不同行**，patch 分别修改各行，互不混淆
- 真正的 bug 是同一行字符写了两次（两行都写 `c == '"'`），与 patch 无关

## 测试用例

```python
fw = fullwidth
assert fw('\u201ctest\u201d') == '\u201ctest\u201d', "左引号应保持"
assert fw('\u201dtest\u201c') == '\u201dtest\u201c', "右引号应保持"
assert fw('"text"') == '\u201c' + 'text' + '\u201d', "ASCII配对→左右引"
assert fw('"a"b"c"') == '\u201c' + 'a\u201d' + 'b\u201c' + 'c\u201d', "三个交替"
```