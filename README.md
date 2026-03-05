# FRUX — 10-K Document Viewer

A Flask app that serves the **Illinois Tool Works Inc.** SEC Form 10-K (fiscal year ended December 31, 2024) in two versions. Version 1 matches the SEC-style document; Version 2 applies a set of UX improvements (side navigation, item-level pagination, etc.) on top of the same underlying content.

**Same content, different experiences.** Both versions share one set of HTML fragments; only layout, CSS, and interactivity change.

---

## Quick Start

```bash
pip install -r requirements.txt
python app.py
```

Then open **http://127.0.0.1:5000**. Use the menu to pick Version 1 (SEC-style) or Version 2 (good UX with side navigation + item-level pagination).

---

## The Idea

- **Version 1** — Baseline. Looks like the document on the SEC site (page numbers, same layout).
- **Version 2** — “Good UX” version that combines multiple enhancements:
  - Sticky side navigation (Parts, Items, and selected subsections)
  - Item-level pagination: each page shows one full Item (as defined by a row in the table of contents)

Content lives in small, reusable fragments. A **fragment registry** (`data/fragments_registry.json`) defines order and metadata. Both version templates pull from that registry and style the output however they want. No duplicated content.

---

## What’s Included

- **Flask app** (`app.py`) — Menu at `/`, versions at `/version/1` and `/version/2`.
- **Templates** — `version1.html` and `version2.html`.
- **Content** — All in `templates/data/fragments/`: title page, table of contents, and every section (Item 1, Item 7, Item 8 notes, Part IV, etc.). One file per logical chunk.
- **Registry** — `data/fragments_registry.json` lists every fragment, its order, titles, and page-break info.
- **CSS** — `static/css/base.css` for shared semantics; `version1.css`, `version2.css`, etc. for version-specific styling.

---

## Project Layout (High Level)

```
FRUX/
├── app.py                    # Flask app and version routes
├── requirements.txt          # Dependencies (Flask)
├── data/
│   └── fragments_registry.json   # Fragment order and metadata
├── static/css/               # base.css + version1.css, version2.css, …
└── templates/
    ├── menu.html             # Home page / version picker
    ├── version1.html         # Version 1 (SEC-style)
    ├── version2.html         # Version 2 (side nav + item-level pagination)
    ├── macros/
    │   └── fragment_macros.html   # Renders each fragment (with or without page numbers)
    └── data/fragments/       # All content: title_page, table_of_contents, item_*.html, part_iv.html, …
```

---

## Extending the Project

Right now the focus is on comparing **Version 1** (control) to **Version 2** (improved UX). If you want to experiment further, you can still add additional templates and routes, but the core research setup assumes just these two versions.

---

## Editing Content

Edit files in **`templates/data/fragments/`**. Changes apply to every version. The registry (`data/fragments_registry.json`) controls which fragments are shown and in what order; add or reorder entries there if you change the document structure.

---

## Tech Stack

- **Backend:** Flask (Python)
- **Templates:** Jinja2 (with Flask)
- **Frontend:** HTML, CSS, optional JavaScript per version
- **Dependencies:** See `requirements.txt` (Flask only for core run)

---

## Reference: Original SEC Files

The **`context/ORIGINAL_SITE/`** folder holds the original, unmodified SEC files (large source HTML, exhibits, XBRL). Use them as reference for how the document looked before we split it into fragments. Don’t edit them.

For more detail on architecture, status, and workflows (including for contributors and tooling), see **`context/PROJECT_SUMMARY.md`**.
