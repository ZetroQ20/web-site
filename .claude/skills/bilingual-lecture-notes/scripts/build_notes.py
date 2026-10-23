#!/usr/bin/env python3
"""Build a .docx (and optionally .pdf) from bilingual Markdown notes with pandoc, then apply a clean study-notes layout:
A4, Calibri, navy headings, running header, page numbers, zebra tables with repeating
header rows, centred figures kept with their captions."""
import subprocess
import sys
from pathlib import Path

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Cm, Pt, RGBColor


NAVY, BLUE, GREY, LINE, ZEBRA = "1F3864", "2E74B5", "595959", "BFBFBF", "F2F6FC"
KEY, KEY_FILL = "C00000", "FDECEA"  # slide emphasis: dark red text, pale red box
FONT = "Calibri"  # LibreOffice renders it with the metric-compatible Carlito


def el(tag, **attrs):
    e = OxmlElement(tag)
    for k, v in attrs.items():
        e.set(qn(f"w:{k}"), v)
    return e


def set_font(style, size, color=None, bold=None):
    style.font.name = FONT
    style.element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:eastAsia"), FONT)
    style.font.size = Pt(size)
    if color:
        style.font.color.rgb = RGBColor.from_string(color)
    if bold is not None:
        style.font.bold = bold


def bottom_border(p_pr, color, size="8"):
    borders = el("w:pBdr")
    borders.append(el("w:bottom", val="single", sz=size, space="2", color=color))
    p_pr.append(borders)


def page_field(paragraph, instr):
    run = paragraph.add_run()
    run._r.append(el("w:fldChar", fldCharType="begin"))
    text = el("w:instrText")
    text.set(qn("xml:space"), "preserve")
    text.text = instr
    run._r.append(text)
    run._r.append(el("w:fldChar", fldCharType="end"))
    return run


def style_document(doc):
    styles = {s.name: s for s in doc.styles}
    names = styles.keys()
    for name in ("Normal", "Body Text", "First Paragraph", "Compact"):
        if name in names:
            st = styles[name]
            set_font(st, 10.5, "262626")
            st.paragraph_format.space_after = Pt(4)
            st.paragraph_format.line_spacing = 1.1
    if "Title" in names:
        st = styles["Title"]
        set_font(st, 22, NAVY, True)
        st.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        st.paragraph_format.space_after = Pt(14)
        bottom_border(st.element.get_or_add_pPr(), BLUE, "12")
    for level, size, color in ((1, 15, NAVY), (2, 12.5, BLUE), (3, 11.5, BLUE), (4, 11, GREY)):
        name = f"Heading {level}"
        if name in names:
            st = styles[name]
            set_font(st, size, color, True)
            st.font.italic = False
            st.paragraph_format.space_before = Pt(16 if level == 1 else 10)
            st.paragraph_format.space_after = Pt(4)
            st.paragraph_format.keep_with_next = True
            if level == 1:
                bottom_border(st.element.get_or_add_pPr(), NAVY)


def style_page(doc, title):
    for section in doc.sections:
        section.page_width, section.page_height = Cm(21), Cm(29.7)
        section.left_margin = section.right_margin = Cm(2)
        section.top_margin, section.bottom_margin = Cm(2), Cm(1.8)
        header = section.header.paragraphs[0]
        header.text = title
        header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        for r in header.runs:
            r.font.size, r.font.color.rgb, r.font.name = Pt(8.5), RGBColor.from_string(GREY), FONT
        bottom_border(header._p.get_or_add_pPr(), LINE, "4")
        footer = section.footer.paragraphs[0]
        footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for part in (page_field(footer, "PAGE"), footer.add_run(" / "), page_field(footer, "NUMPAGES")):
            part.font.size, part.font.color.rgb = Pt(8.5), RGBColor.from_string(GREY)


def style_table(table):
    tbl_pr = table._tbl.tblPr
    borders = el("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        borders.append(el(f"w:{edge}", val="single", sz="4", color=LINE))
    tbl_pr.append(borders)
    tbl_pr.append(el("w:tblW", w="5000", type="pct"))
    for i, row in enumerate(table.rows):
        tr_pr = row._tr.get_or_add_trPr()
        tr_pr.append(el("w:cantSplit"))
        if i == 0:
            tr_pr.append(el("w:tblHeader"))
        for cell in row.cells:
            fill = NAVY if i == 0 else (ZEBRA if i % 2 == 0 else "FFFFFF")
            cell._tc.get_or_add_tcPr().append(el("w:shd", val="clear", color="auto", fill=fill))
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(1)
                p.paragraph_format.space_after = Pt(1)
                for r in p.runs:
                    r.font.size = Pt(9.5)
                    if i == 0:
                        r.font.color.rgb = RGBColor.from_string("FFFFFF")


def style_figures(doc):
    paragraphs = doc.paragraphs
    for i, p in enumerate(paragraphs):
        if p._p.xpath(".//w:drawing"):
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.keep_with_next = True
            p.paragraph_format.space_before = Pt(6)
            if i + 1 < len(paragraphs):
                cap = paragraphs[i + 1]
                cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
                cap.paragraph_format.space_after = Pt(10)
                for r in cap.runs:
                    r.font.size = Pt(9)
                    r.font.color.rgb = RGBColor.from_string(GREY)


def style_emphasis(doc):
    """Colour the custom styles the notes use for slide emphasis: Key (phrase) and Important (box)."""
    styles = {s.name: s for s in doc.styles}
    if "Key" in styles:
        styles["Key"].font.color.rgb = RGBColor.from_string(KEY)
    if "Important" in styles:
        st = styles["Important"]
        set_font(st, 10.5, "262626")
        st.paragraph_format.space_before = Pt(6)
        st.paragraph_format.space_after = Pt(6)
        st.paragraph_format.left_indent = Cm(0.3)
        p_pr = st.element.get_or_add_pPr()
        borders = el("w:pBdr")
        for edge in ("top", "left", "bottom", "right"):
            borders.append(el(f"w:{edge}", val="single", sz="6" if edge != "left" else "24", space="4", color=KEY))
        p_pr.append(borders)
        p_pr.append(el("w:shd", val="clear", color="auto", fill=KEY_FILL))


def polish(docx_path, title):
    doc = Document(docx_path)
    style_document(doc)
    style_page(doc, title)
    for table in doc.tables:
        style_table(table)
    style_figures(doc)
    style_emphasis(doc)
    doc.save(docx_path)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        sys.exit("usage: build_notes.py <notes.md> [--pdf]")
    md = Path(args[0])
    out = md.with_suffix(".docx")
    subprocess.run(["pandoc", str(md), "-f", "markdown+pipe_tables", f"--resource-path={md.parent}", "-o", str(out)],
                   check=True)
    title = next((l.split(":", 1)[1].strip().strip('"') for l in md.read_text().splitlines()
                  if l.startswith("title:")), md.stem)
    polish(out, title)
    print(out)
    if "--pdf" in sys.argv:
        subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(out.parent), str(out)],
                       check=True, stdout=subprocess.DEVNULL)
        print(out.with_suffix(".pdf"))


if __name__ == "__main__":
    main()
