#!/usr/bin/env python3
"""Two-way completeness check between extracted slide text and the bilingual notes.

    check_notes.py <slides.md from extract_slides.py> <notes.md>

1. Missing: content words of each slide that never appear in the notes -> slides to re-read.
2. Extra: words in the bold English of the notes that never appear in the slide text -> each must
   come from a slide image, a table header or a caption; otherwise it is added content: remove it.
3. Format: Turkish wrapped in bold, Key spans with wrong brackets, leftover FIG lines.
Spelling variants (colour/color, -ise/-ize, oe/ae) are normalised; review the lists by eye.
"""
import re
import sys

STOP = set("""this that with from these those which their there they them have been were will into such than then
also only most more other very when where what about could would should under after before between through using
used within upon each both many some various being including include includes generally because while during
taken taking called found""".split())


def norm(t):
    t = t.lower().replace("colour", "color").replace("behaviour", "behavior").replace("centre", "center").replace("tumour", "tumor")
    return re.sub(r"(?<=[a-z])(oe|ae)|\\boe(?=[a-z])", "e", re.sub(r"is(e|ed|ation|ing)\b", r"iz\1", t))


def main(slides_path, notes_path):
    raw = open(slides_path).read()
    notes = open(notes_path).read()
    notes_body = re.sub(r"!\[\]\([^)]*\)\{[^}]*\}", "", notes)
    n_all = norm(notes_body)
    # bullets extracted as glyphs (ü ✓ Ø •) glue onto the next word: strip them
    raw = re.sub(r"(?m)^[üØ•▪✓√➢]\s*", "", raw)
    parts = re.split(r"^## (?:Page|Slide) (\d+)\n", raw, flags=re.M)[1:]
    # a line that repeats on most slides is template chrome (e.g. "LECTURE CONTENT TITLE"): ignore it
    counts = {}
    for text in parts[1::2]:
        for ln in set(text.splitlines()):
            counts[ln.strip()] = counts.get(ln.strip(), 0) + 1
    chrome = {ln for ln, n in counts.items() if ln and n > len(parts) / 4 and not ln.startswith("|")}
    parts[1::2] = ["\n".join(ln for ln in t.splitlines() if ln.strip() not in chrome) for t in parts[1::2]]
    print("== Slide words missing from the notes ==")
    for num, text in zip(parts[::2], parts[1::2]):
        text = norm(re.sub(r"^\|.*$", "", text, flags=re.M))
        miss = sorted(w for w in set(re.findall(r"[a-zçğışöü]{4,}", text))
                      if w not in STOP and w not in n_all and w.rstrip("s") not in n_all)
        if miss:
            print(f"  page {num}: {', '.join(miss)}")
    print("== Words in the notes' English that are not in the slide text ==")
    s_all = norm(raw)
    eng = norm(re.sub(r"\{custom-style=\"\w+\"\}", "", " ".join(re.findall(r"\*\*(.+?)\*\*", notes_body))))
    extra = sorted(w for w in set(re.findall(r"[a-z]{4,}", eng)) if w not in s_all and w.rstrip("s") not in s_all)
    print("  " + ", ".join(extra))
    print("== Format problems ==")
    for i, line in enumerate(notes.splitlines(), 1):
        if re.search(r"\]\(custom-style", line) or line.startswith("FIG:"):
            print(f"  line {i}: {line[:90]}")
    # slide-number gaps (slide numbers printed in the footer as the last line of a page)
    nums = []
    for text in parts[1::2]:
        digits = [ln.strip() for ln in text.splitlines() if re.fullmatch(r"\d{1,3}", ln.strip())]
        if digits:
            nums.append(int(digits[-1]))
    rising = sum(b > a for a, b in zip(nums, nums[1:]))
    if nums and rising < 0.8 * (len(nums) - 1):
        print("== No reliable footer slide numbering (numbers do not rise page by page): check completeness by eye ==")
    elif nums:
        gaps = sorted(set(range(min(nums), max(nums) + 1)) - set(nums))
        print(f"== Footer slide numbers {min(nums)}–{max(nums)}; missing: {gaps or 'none'} ==")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(*sys.argv[1:])
