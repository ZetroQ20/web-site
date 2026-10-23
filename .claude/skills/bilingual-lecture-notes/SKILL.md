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

6. **Colour by meaning (house theme).** Mark phrases with a span style —
   inside the bold English and on the matching Turkish words, so English
   stays bold and Turkish stays normal weight:

   | Span | Colour | Use for |
   |---|---|---|
   | `[..]{custom-style="Key"}` | red | cut-off values, thresholds, numbers to memorise, the slide's red/bold emphasis |
   | `[..]{custom-style="Def"}` | green | the term being defined in a definition |
   | `[..]{custom-style="Warn"}` | orange | mistakes, "never / avoid / not" rules |
   | `[..]{custom-style="Formula"}` | purple | a formula written in prose (formulas in backticks are purple automatically) |

   ```markdown
   **[Anthropometry]{custom-style="Def"} is the science of …** [Antropometri]{custom-style="Def"}, … bilimidir.
   **BMI is [not appropriate for athletes]{custom-style="Warn"}.** BKİ [sporcular için uygun değildir]{custom-style="Warn"}.
   ```

   Keep it sparse — a phrase, not a paragraph. Slide call-out boxes become
   typed boxes, chosen by the slide's own label:

   ```markdown
   ::: {custom-style="Tip"}        <!-- 💡 green: tip, clinical tip, key point, in practice -->
   ::: {custom-style="Warning"}    <!-- ⚠️ orange: watch out, avoid, caution, common errors -->
   ::: {custom-style="Remember"}   <!-- 📌 blue: remember, note, key message, definitions to learn -->
   ```

   Each top-level `#` section automatically gets its own colour (headings,
   rule, table header; pastel zebra rows), so split the notes into `#`
   sections by topic. Colour never adds content: it only marks text that is
   already there.

## Compression rules (compact, but nothing important lost)

- **Tables and charts that exist only as pictures** (cut-off tables,
  timelines, colour-code tables) are read at 200+ dpi and typed out as real
  tables, with the picture kept as a figure.
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
2b. **Images — use `scripts/figures.py`.** While writing, put a placeholder
   line where a slide's images belong:
   `FIG:p34,p35|3.3|**Moon face (slide 53).**|Ay yüz (slayt 53).`
   (`pNN` = PDF page, number = max height in cm). Charts, timelines and
   diagrams drawn as vectors are not embedded images: crop a page region
   with `pNN@x0,y0,x1,y1` in PDF points (`pdfinfo` gives the page size;
   a 50-dpi contact-sheet pixel × 1.44 = points). Then
   `figures.py crop <slides.pdf> <notes.md>` crops every content image into
   `img/` and writes `img/_sheet.png`; look at the sheet, and
   `figures.py expand <notes.md> --skip p32_2,...` drops arrows/title bars and
   writes the image rows (sized to fit the page width). Images that bleed off
   the slide top or sit on a full-slide background are skipped by `crop` —
   compare the sheet with the slide contact sheets and crop those by hand.
   Manual method, for reference: Get each content image's bbox with
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
3. **Run `scripts/check_notes.py <slides.md> <notes.md>`** — it lists slide
   words missing from the notes (re-read those slides), English words in the
   notes absent from the slide text (each must come from an image, header
   or caption, else delete it), format errors, and gaps in the footer slide
   numbers (tell the user the deck is incomplete). Then **check** by eye — compare against **rendered images of every
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

   The script uses pandoc, then applies the house layout: A4, Calibri,
   navy headings (H1 underlined), the `title:` front-matter as a running
   header, page numbers (x / y), zebra tables with navy header rows that
   repeat across pages, and centred figures kept with their captions.
   Always start the notes with a `title:` front-matter block. Render one page of the PDF (or convert the docx) to PNG and look
   at it to confirm tables and bold/normal formatting came out right.
4b. **Long decks (60+ slides).** Work in chunks of ~20 slides: extract,
   view that chunk's contact sheets, write that part of the notes, then
   move on — never write from memory of slides viewed long ago. Keep a
   running checklist of slide numbers covered so none is skipped, and re-run
   the step-3 comparison over the whole deck at the end.
5. **Deliver** the .docx (and .pdf) to the user; put generated files in the
   scratchpad or a folder the user names — do not commit them to this repo
   unless asked.
