# FRUX Project Summary

## Overview

**FRUX** is a Flask-based web application that provides an improved user experience for reading SEC 10-K filings. The project focuses on the Illinois Tool Works Inc. (ITW) SEC Form 10-K filing for the fiscal year ended December 31, 2024.

## Overarching Goal

The primary goal of this project is to present the same 10-K document in **two versions**:

- **Version 1**: Baseline that replicates the exact appearance of the document as it appears on the SEC website.
- **Version 2**: A “good UX” version that applies multiple usability improvements (e.g. side navigation, item-level pagination) while using the same underlying content.

The core philosophy is **content reusability**: both versions share the same content fragments and differ only in presentation (layout, styling, and interactive features).

## Technical Requirements

### Technology Stack
- **Backend**: Flask (Python web framework)
- **Templating**: Jinja2 (included with Flask)
- **Frontend**: HTML, CSS, JavaScript
- **Dependencies**: Minimal - only Flask required (see `requirements.txt`)

### Architecture

1. **Modular Content Structure**
   - All content fragments, including **title page and table of contents**, live in `templates/data/fragments/` (e.g. `title_page.html`, `table_of_contents.html`, `item_1_general.html`, `item_8_ntfs_leases.html`, `part_iv.html`). Order and metadata are defined in `data/fragments_registry.json`. The fragment macro includes from `data/fragments/` for every fragment. The `templates/fragments/` folder has been removed.

2. **Version System**
   - Each version is a separate template in `templates/` (`version1.html`, `version2.html`). Both versions use the same HTML fragments from `templates/data/fragments/` and the registry; they differ only in presentation (CSS, JavaScript, layout).
   - **Version 1**: Baseline—SEC-like appearance (page numbers, etc.).
   - **Version 2**: Same fragments, with multiple UX improvements combined (e.g. side navigation and item-level pagination). The Flask app routes `/version/1` and `/version/2` to the appropriate templates.

3. **Flask Application** (`app.py`)
   - Main route (`/`) serves the menu page for version selection
   - Version routes (`/version/1` and `/version/2`) serve the corresponding template with fragments from the registry. Version 1 has a fallback (title + ToC only) when the registry is empty; Version 2 requires the registry.

4. **Styling**
   - Shared, semantic styles (e.g., `section-heading`, `body-text`, `table-*` classes, page-number helpers, spacing utilities) live in `static/css/base.css`
   - Version-specific styles live in `static/css/version1.css`, `static/css/version2.css`, etc.
   - New layout and fragment work should target the `static/css/` files

### Key Design Decisions

1. **Content vs. Presentation Separation**
   - Content is stored in fragments (data)
   - Presentation is handled by version templates (view)
   - This allows easy creation of new versions without duplicating content

2. **XBRL Removal**
   - All XBRL (eXtensible Business Reporting Language) tags and attributes were removed from the HTML
   - The document is now pure HTML/CSS for easier manipulation

3. **File Organization**
   - Root-level exhibit files (e.g., `exhibit-10m-benefit-plan.html`) are standalone exhibit documents
   - Main document content is in `templates/data/fragments/`
   - Static assets (CSS, images) are in `static/`

4. **Three-Layer Fragment / Registry Architecture**
   - **Content layer**: semantic, version-agnostic fragments in `templates/data/fragments/` (no page numbers, no inline `style-*`)
   - **Metadata layer**: `data/fragments_registry.json` stores fragment IDs, titles, item relationships, order, page numbers and page breaks
   - **Presentation layer**: version templates (`templates/version1.html`, `version2.html`, etc.) and CSS in `static/css/` render fragments; the fragment macro in `templates/macros/fragment_macros.html` injects page numbers or not depending on the version

## ORIGINAL_SITE Folder

The `ORIGINAL_SITE` folder contains the **original, unmodified files** downloaded directly from the SEC website. This serves as:

1. **Reference Material**: The source of truth for how the document originally appeared
2. **Comparison Baseline**: Used to verify that Version 1 matches the original appearance
3. **Backup**: Preserves the original files in case they're needed for reference

### Contents of ORIGINAL_SITE

- **Main Document**: `itw-20241231.htm` - The complete 10-K filing HTML
- **Exhibit Files**: Multiple `.htm` files for various exhibits (10m, 10n, 10o, 19, 21, 23, 24, 31, 32, 4n, 97)
- **XBRL Files**: XML files containing structured financial data:
  - `itw-20241231_cal.xml` - Calculation linkbase
  - `itw-20241231_def.xml` - Definition linkbase
  - `itw-20241231_lab.xml` - Label linkbase
  - `itw-20241231_pre.xml` - Presentation linkbase
  - `itw-20241231.xsd` - XML Schema Definition
- **Assets**: `itw-20241231_g1.jpg` - Company logo/image

### Important Notes About ORIGINAL_SITE

- These files are **read-only reference material** - do not modify them
- The files contain XBRL markup and SEC-specific formatting
- The main document (`itw-20241231.htm`) is extremely large (over 600,000 lines)
- These files are used to understand the original structure and styling

## Current Project Status

### Completed
- ✅ **Fragment cleanup complete**: All content, including title page and table of contents, lives in `templates/data/fragments/`; `data/fragments_registry.json` defines order and metadata. The legacy `templates/fragments/` folder has been removed.
- ✅ Version 1: Baseline (original SEC format, exact replica)
- ✅ Version 2: Same fragments as Version 1, with combined UX enhancements:
  - Sticky side navigation that lists Parts, Items, and selected subsections
  - Item-level pagination: each page shows one full Item (as defined by a row in the table of contents)
- ✅ Flask application structure and menu for version selection
- ✅ Three-layer fragment architecture: `templates/data/fragments/`, `data/fragments_registry.json`, version templates + `static/css/`
- ✅ Consolidated version templates: single `version1.html` and `version2.html` (no separate _test templates)

### Next Phase
- Evaluate additional UX improvements (e.g. search, print-optimized layout, mobile-specific tweaks, accessibility refinements).
- If needed, evolve Version 2 further rather than adding more numbered versions.

## File Structure

```
FRUX/
├── app.py                          # Flask application
├── requirements.txt                # Python dependencies
├── README.md                       # Project documentation
├── SETUP.md                        # Setup instructions
├── Procfile                        # Deployment configuration
├── context/                        # Context and reference materials
│   ├── ORIGINAL_SITE/             # Original SEC files (reference)
│   └── PROJECT_SUMMARY.md         # This file
├── data/
│   └── fragments_registry.json    # Fragment metadata (order, pages, titles)
├── static/
│   └── css/                       # Shared and version-specific CSS
│       ├── base.css               # Shared semantic styles (tables, text, spacing)
│       ├── version1.css           # Version 1 (SEC-like) presentation
│       └── version2.css           # Version 2 (side nav + item-level pagination) presentation
└── templates/
    ├── menu.html                  # Main menu page
    ├── version1.html              # Version 1 (baseline); uses fragments when registry has data
    ├── version2.html              # Version 2 (combined UX: side nav + item-level pagination)
    ├── macros/
    │   └── fragment_macros.html   # Renders a fragment (includes from data/fragments/)
    └── data/
        └── fragments/            # All content fragments (title page, ToC, items, part IV, etc.)
            ├── title_page.html
            ├── table_of_contents.html
            ├── item_1_general.html
            ├── item_1_business_model.html
            ├── item_8_ntfs_*.html
            ├── part_iv.html
            └── ...               # See fragments_registry.json for full list
```

## Development Workflow

1. **To add a new version (e.g. version 3)**:
   - Copy `version2.html` (or the latest version) to `version3.html`
   - Add one UX improvement (e.g. side nav, pagination) via CSS/JS and any needed markup in the template
   - Add a route in `app.py` for the new version (render `version3.html` with `fragments`)
   - Add `static/css/version3.css` if needed. All versions use the same fragments from the registry.

2. **To modify content**:
   - Edit the appropriate file in `templates/data/fragments/`
   - Changes apply to all versions automatically

3. **To fix styling**:
   - Shared semantics: `static/css/base.css`
   - Version-specific: `static/css/version1.css`, `version2.css`, etc. Legacy `static/styles.css` is still linked for compatibility

## Key Technical Challenges Addressed

1. **Large File Management**: The original document was split into manageable fragments, with further refinement to split items 1-16 into individual files for easier debugging and maintenance
2. **Layout Consistency**: Maintaining exact SEC appearance while enabling future enhancements
3. **Content Reusability**: Ensuring all versions share the same content source
4. **Table Layout**: Complex table structures with colspan attributes for proper spacing (recently fixed for edge-to-edge layout)
5. **Fragment Granularity**: Balancing between too many small files (hard to manage) and too few large files (hard to debug) - current structure provides one file per SEC item for optimal maintainability

## Running the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Run Flask app
python app.py

# Visit http://127.0.0.1:5000
```

## For New AI Agents

When working on this project:

1. **Always reference ORIGINAL_SITE** when you need to see how something originally appeared
2. **Respect the fragment structure**—all versions use the same HTML from `templates/data/fragments/` and the registry; don't duplicate content
3. **Version 1 is the baseline**—keep its visual appearance (SEC-like) unchanged
4. **Fragment rendering** is in `templates/macros/fragment_macros.html`; all fragments (including title page and table of contents) are included from `templates/data/fragments/` per registry
5. **New versions = same fragments, one UX improvement each** (side nav, pagination, search, etc.) so we can compare and later combine
6. **Table structures** use semantic classes from `base.css` and colspan where needed
7. **Items 10-14** are often incorporated by reference; their fragments may be minimal placeholders

## Future Enhancements (Next Phase)

Each of these can be implemented as a **single UX improvement** in its own version (same fragments as version 1):

- **Side navigation** (sticky or floating TOC / section nav) — e.g. version 2 or 3
- **Pagination** (page-by-page or section-by-section) — e.g. version 3 or 4
- Search, print-optimized layout, mobile tweaks, accessibility improvements, etc.
- **Final version**: combine the chosen enhancements into one version

