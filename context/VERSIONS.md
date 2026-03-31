# 10-K viewer: version comparison

This document summarizes how each **version** of the Illinois Tool Works Form 10-K viewer differs. All versions use the same fragment content from `templates/data/fragments/` and `data/fragments_registry.json`; differences are layout, styling, and client-side behavior.

---

## Version 1 (`/version/1`)

- **Purpose:** Baseline that closely matches the traditional SEC-style reading experience.
- **Layout:** Single scrolling document (no item-level pagination).
- **Styling:** Original typography and spacing (`base.css` / version 1 styles); **page numbers** and **page breaks** appear as in the source filing.
- **Navigation:** No side navigation; users scroll or use in-document links (e.g. table of contents).

---

## Version 2 (`/version/2`)

- **Starting point:** Same content as Version 1, with UX-oriented presentation changes.
- **Side navigation:** Dynamic nav built from document headings (`h2` Parts, `h3` Items, `h4` sections). Expand/collapse with chevrons; only the current branch is expanded by default where applicable.
- **Pagination:** Document split into **one “page” per item** (plus dedicated pages for title, table of contents, and Part IV as configured in `app.build_item_pages`). **Previous / Next** controls move between items; labels show short names (e.g. `Item 5`).
- **Scrolling:** In-page hash links avoid jumping to the top before scrolling when the target is on the **current** page.
- **IDs:** Heading `id`s are scoped by fragment/page so duplicate section titles in different items resolve to distinct anchors.
- **Version 2–specific styling:** Main column **max-width 1000px**, centered; **Roboto** and adjusted body size; **page numbers / breaks hidden** in this view.

**Special grouping (shared by v2 / 3A / 3B):** Items **10–14** (Part III) are combined onto **one** pagination page; **Part IV** is its own page. Item headings still appear separately in the side nav.

---

## Version 3A (`/version/3a`)

- **Base:** Everything in **Version 2** (same pagination rules, same side nav behavior, same main-column and font choices unless overridden).
- **Part labels (side nav only):** Part rows in the nav use long labels, e.g.  
`PART I: Business & Risks`, `PART II: Financial Performance`, `PART III: Governance & Compensation`, `PART IV: Legal Exhibits`.  
**In-document** `h2` text is unchanged.
- **Breadcrumbs:** A **sticky** bar at the top of the main column shows location as `10-K / …` with **slash** separators. Segments are **links** where applicable (e.g. root to title page, part/item/section to anchors). Title page and table of contents get dedicated crumb lines (`10-K / Title Page`, `10-K / Table of Contents`).
- **Breadcrumbs logic:** Part is inferred from the **item** when the current pagination page does not include the Part `h2` (e.g. Item 6). Stale crumbs on title/TOC are avoided by always refreshing when the active page changes.

---

## Version 3B (`/version/3b`)

- **Base:** Same as **Version 3A** (labels, breadcrumbs, pagination, styling chain through `version3a.css`).
- **Quick Access:** An extra block **above** the main side nav with a collapsible **“Quick Access”** header and shortcut links to high-traffic items:
  - ITEM 1. Business  
  - ITEM 1A. Risk Factors  
  - ITEM 7. MD&A  
  - ITEM 8. Financial Statements  
  Links target the same anchors as the full nav (resolved after headings receive IDs). Same-page clicks use smooth scrolling; cross-page behavior uses the existing pagination + hash logic.

---

## Quick reference


| Feature                        | v1  | v2     | 3A     | 3B                 |
| ------------------------------ | --- | ------ | ------ | ------------------ |
| SEC-style page numbers in view | Yes | Hidden | Hidden | Hidden             |
| Side nav                       | No  | Yes    | Yes    | Yes + Quick Access |
| Item pagination                | No  | Yes    | Yes    | Yes                |
| Custom Part labels in nav      | —   | No     | Yes    | Yes                |
| Sticky breadcrumbs             | —   | No     | Yes    | Yes                |
| Quick Access shortcuts         | —   | No     | No     | Yes                |


---

## Routes (Flask)


| Route         | Template         |
| ------------- | ---------------- |
| `/`           | `menu.html`      |
| `/version/1`  | `version1.html`  |
| `/version/2`  | `version2.html`  |
| `/version/3a` | `version3a.html` |
| `/version/3b` | `version3b.html` |


