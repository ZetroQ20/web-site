---
name: bilingual-lecture-notes
description: Turn lecture slides (PDF, PPTX, images) into compact bilingual study notes — every English sentence in bold, immediately followed by its Turkish translation in normal weight — with tables carried over as real tables, exported to Word (.docx) and optionally PDF. Use when the user sends slides / ders notu / sunum and asks for summarised, compact, English–Turkish or "ingilizce kalın, türkçe normal" notes.
---

# Bilingual Lecture Notes (EN bold + TR normal)

Goal: a **shorter** version of the slide deck that still keeps every
exam-relevant point, written as English–Turkish sentence pairs.

## Output format rules

1. **Sentence pairs.** Every English sentence is bold, followed on the same
   line by its Turkish translation in normal weight:

   ```markdown
   **Photosynthesis converts light energy into chemical energy.** Fotosentez ışık enerjisini kimyasal enerjiye dönüştürür.
   ```

   - One pair per sentence — never bold a whole paragraph and then translate
     the whole paragraph.
   - Bullets keep the same pattern: `- **English.** Türkçe.`
   - Turkish must be natural Turkish, not word-for-word; keep technical terms
     recognisable — on first use add the English term in parentheses if the
     Turkish word is not standard, e.g. `önbellek (cache)`.
2. **Headings** keep the slide's structure, both languages:
   `## Memory Hierarchy / Bellek Hiyerarşisi`.
3. **Tables** are reproduced as Markdown pipe tables with the same rows and
   columns as the slide — never flattened into prose and never dropped.
   - Header cells: `**English** / Türkçe`.
   - Body cells: short terms/values as `**English** (Türkçe)`; full sentences
     as `**English.** Türkçe.`; numbers, formulas, units, code unchanged.
   - Merged cells: repeat the value in each row so the table stays rectangular.
4. **Formulas, code, units, abbreviations** stay as they are. Write formulas
   as plain Unicode text in backticks, e.g. `` `BMI = kg / m²` ``,
   `` `(0.98 × CC) − 81.69` `` (use ×, −, ², π). Never use LaTeX `$...$`:
   the PDF conversion silently drops equations. Read formula images on the
   slides visually — they have no text layer.
5. **Figures/diagrams** that carry content are described in one or two
   sentence pairs (what it shows, the key takeaway). Decorative images are
   ignored. If the user wants pictures, include the slide images too (see
   step 2b); text-only figures (tables, cut-off charts) are also typed out
   as tables so nothing lives only in a picture.

## Compression rules (compact, but nothing important lost)

- **Slide content only.** Add nothing the slides do not say: no textbook
  definitions, no "in practice" explanations, no corrected formulas, no
  inferred anatomy. If a slide looks wrong or two slides conflict, keep both
  as written and add one clearly labelled *Note / Not* line.

- Keep: definitions, rules/laws, formulas, numbered steps, comparisons,
  classifications, advantages/disadvantages, examples that illustrate a
  rule, anything the lecturer marked as important (bold, colour, "note",
  "exam", "remember").
- Merge: repeated points across slides, title slides, agenda/outline slides,
  "recap" slides that repeat earlier content.
- Drop: slide numbers, footers, logos, filler ("Let's look at…",
  "Questions?"), references slides (unless asked).
- Rewrite long bullet chains into a few precise sentences; prefer short
  sentences so each EN/TR pair stays readable.
- Target roughly 40–60 % of the original word count; never cut a table row,
  a formula, or a definition to hit the target.

## Workflow

1. **Extract** the slide text and tables (scripts are in this skill's folder;
   run from the repo root):

   ```bash
   python3 -I .claude/skills/bilingual-lecture-notes/scripts/extract_slides.py <slides.pdf|slides.pptx> > "$SCRATCH/slides.md"
   ```

   - PPTX: text frames and real table objects come out per slide.
   - PDF: page text plus any tables `pdfplumber` detects. If a page has
     little or no text (scanned), render it to an image and read it visually:
     `pdftoppm -r 110 -png -f N -l N slides.pdf "$SCRATCH/page"` then Read the PNG.
   - Images: Read them directly.
   Always spot-check tables against a rendered page image — extraction can
   split or merge cells.
2. **Write** the notes in Markdown following the rules above
   (`<name>-notes.md`), section by section in slide order.
2b. **Images (when asked).** Get each content image's bbox with
   `pdfplumber` (`page.images`, skip the logo and title-bar images), render
   the page with `pdftoppm -r 200` and crop the bbox (scale 200/72). Trim
   any slide text that bleeds into a crop, save as JPEG (max 1100 px), and
   look at a contact sheet (`montage`) of all crops before using them.
   Place each image directly under the text of the slide it came from, with
   images from the same slide side by side and a sized height:
   `![](img/s28_1.jpg){height=4.5cm} ![](img/s28_2.jpg){height=4.5cm}`,
   followed by a caption pair naming the slide:
   `*__Arm length (slide 28).__* Kol uzunluğu (slayt 28).`
   Keep `img/` next to the notes file — the build script resolves image
   paths relative to it.
3. **Check** before building — compare against **rendered images of every
   slide** (a `montage` contact sheet of 6 slides per image), not only the
   extracted text: cut-off values, tables and labels often exist only in
   pictures.
   - every slide table appears as a table with the same shape;
   - no English sentence is missing its Turkish pair, no Turkish sentence is bold;
   - definitions/formulas from the slides are all present.
4. **Build** the Word file (and PDF if asked):

   ```bash
   python3 .claude/skills/bilingual-lecture-notes/scripts/build_notes.py <name>-notes.md            # -> .docx
   python3 .claude/skills/bilingual-lecture-notes/scripts/build_notes.py <name>-notes.md --pdf      # -> .docx + .pdf
   ```

   The script uses pandoc, adds table borders, header shading and compact
   spacing. Render one page of the PDF (or convert the docx) to PNG and look
   at it to confirm tables and bold/normal formatting came out right.
5. **Deliver** the .docx (and .pdf) to the user; put generated files in the
   scratchpad or a folder the user names — do not commit them to this repo
   unless asked.
