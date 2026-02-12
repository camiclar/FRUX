# FRUX — 10-K Document Viewer

A Flask app that serves the **Illinois Tool Works Inc.** SEC Form 10-K (fiscal year ended December 31, 2024) in multiple versions. Version 1 matches the SEC-style document; future versions add one UX improvement each (side nav, pagination, search, etc.) so we can compare and eventually combine the best bits.

**Same content, different experiences.** All versions share one set of HTML fragments; only layout, CSS, and interactivity change.

---

## Quick Start

```bash
pip install -r requirements.txt
python app.py
```

Then open **http://127.0.0.1:5000**. Use the menu to pick Version 1 (SEC-style) or Version 2 (no page numbers; more enhancements to come).

---

## The Idea

- **Version 1** — Baseline. Looks like the document on the SEC site (page numbers, same layout).
- **Versions 2–9** — Each version adds *one* UX enhancement: e.g. sticky side navigation, pagination, search, print-friendly layout. Same HTML, different presentation.
- **Version 10** — Combine the chosen enhancements into a single “best of” version.

Content lives in small, reusable fragments. A **fragment registry** (`data/fragments_registry.json`) defines order and metadata. Version templates pull from that registry and style the output however they want. No duplicated content.

---

## What’s Included

- **Flask app** (`app.py`) — Menu at `/`, versions at `/version/1`, `/version/2`, etc.
- **Templates** — `version1.html` and `version2.html` (more as we add versions).
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
    ├── version2.html         # Version 2 (no page numbers; add UX here)
    ├── macros/
    │   └── fragment_macros.html   # Renders each fragment (with or without page numbers)
    └── data/fragments/       # All content: title_page, table_of_contents, item_*.html, part_iv.html, …
```

---

## Adding a New Version

1. Copy the latest version template (e.g. `version2.html`) to `version3.html`.
2. Add your one UX improvement (e.g. side nav or pagination) in the template and in a new `static/css/version3.css` if needed.
3. In `app.py`, add a branch for version 3 that renders `version3.html` with the same `fragments` list.
4. All versions automatically use the same fragments from the registry — no content duplication.

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
