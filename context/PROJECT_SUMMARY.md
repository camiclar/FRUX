# FRUX Project Summary

## Overview

**FRUX** is a Flask-based web application that provides an improved user experience for reading SEC 10-K filings. The project focuses on the Illinois Tool Works Inc. (ITW) SEC Form 10-K filing for the fiscal year ended December 31, 2024.

## Overarching Goal

The primary goal of this project is to create **10 different versions** of the same 10-K document, each with progressively enhanced user experience features. Version 1 serves as a baseline that replicates the exact appearance of the document as it appears on the SEC website, while future versions will add features like floating navigation, pagination, and other UX improvements.

The core philosophy is **content reusability**: all versions share the same content fragments, but present them with different layouts, styling, and interactive features.

## Technical Requirements

### Technology Stack
- **Backend**: Flask (Python web framework)
- **Templating**: Jinja2 (included with Flask)
- **Frontend**: HTML, CSS, JavaScript
- **Dependencies**: Minimal - only Flask required (see `requirements.txt`)

### Architecture

1. **Modular Content Structure**
   - The original 28,838-line HTML document has been split into manageable fragments
   - All content fragments are stored in `templates/fragments/`
   - Each fragment represents a logical section of the document:
     - `head.html` - HTML head section with metadata
     - `title_page.html` - Title page (company info, SEC form header, etc.)
     - `contents.html` - Table of contents
     - `item_1.html` through `item_16.html` - Individual SEC 10-K items (each item gets its own fragment)
       - Item 1: Business
       - Item 2: Properties
       - Item 3: Legal Proceedings
       - Item 4: Mine Safety Disclosures
       - Item 5: Market for Registrant's Common Equity
       - Item 6: Reserved
       - Item 7: Management's Discussion and Analysis
       - Item 8: Financial Statements and Supplementary Data
       - Item 9: Changes in and Disagreements With Accountants
       - Items 10-14: Part III items (typically incorporated by reference)
       - Item 15: Exhibit and Financial Statement Schedules
       - Item 16: Form 10-K Summary
     - `closing.html` - Closing HTML tags
   - **Note**: The old `part1.html`, `part2.html`, `part3.html`, `part4.html`, and `header.html` files are preserved for reference but are no longer used in the current version structure

2. **Version System**
   - Each version is a separate template file (e.g., `version1.html`, `version2.html`)
   - All versions include the same content fragments
   - Versions differ only in presentation (CSS, JavaScript, layout)
   - The Flask app routes `/version/<number>` to the appropriate template

3. **Flask Application** (`app.py`)
   - Main route (`/`) serves the menu page for version selection
   - Version routes (`/version/<int:version>`) serve specific versions
   - Currently only Version 1 is implemented; versions 2-10 are planned

4. **Styling**
   - Shared, semantic styles (e.g., `section-heading`, `body-text`, `table-*` classes, page-number helpers, spacing utilities) live in `static/css/base.css`
   - Version-specific styles live in `static/css/version1.css`, `static/css/version2.css`, etc.
   - A legacy `static/styles.css` still exists, but new layout and fragment work should target the `static/css/` files
   - Inline `style-*` classes from the original SEC HTML are being systematically replaced by semantic classes defined in `base.css`

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
   - Main document content is in `templates/fragments/`
   - Static assets (CSS, images) are in `static/`

4. **Three-Layer Fragment / Registry Architecture**
   - **Content layer**: semantic, version-agnostic fragments in `templates/data/fragments/` (no page numbers, no inline `style-*`)
   - **Metadata layer**: `data/fragments_registry.json` stores fragment IDs, titles, item relationships, order, page numbers and page breaks
   - **Presentation layer**: version templates in `templates/versions/` plus CSS in `static/css/` render fragments with or without page numbers depending on the version
   - See `ARCHITECTURE_SUMMARY.md` for detailed examples and the longer-term fragment plan

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
- ✅ Version 1: Original SEC format (exact replica)
- ✅ Content fragmentation and organization (legacy `templates/fragments/` per-item files)
- ✅ Flask application structure
- ✅ Menu system for version selection
- ✅ Initial CSS extraction and organization
- ✅ Core three-layer fragment architecture implemented (`templates/data/fragments/`, `data/fragments_registry.json`, `static/css/*`)
- ✅ Several Item 8 note fragments migrated to semantic HTML and registered in the fragment registry:
  - `item_8_ntfs_leases`
  - `item_8_ntfs_debt`
  - `item_8_ntfs_goodwill_intangible_assets`
  - `item_8_ntfs_pension_postretirement_benefits`

### In Progress / Planned
- 🚧 Version 2: Floating navigation
- 🚧 Version 3: Pagination
- 🚧 Versions 4-9: Additional UX enhancements (TBD)
- 🚧 Version 10: All enhancements combined
- 🚧 Continue migrating remaining Item 8 note fragments (e.g., commitments & contingencies, stockholders' equity) into `templates/data/fragments/` and `data/fragments_registry.json`

## File Structure

```
FRUX/
├── app.py                          # Flask application
├── requirements.txt                # Python dependencies
├── README.md                       # Project documentation
├── SETUP.md                        # Setup instructions
├── SETUP_COMPLETE.md               # Notes on completed setup / refactors
├── Procfile                        # Deployment configuration
├── index.html                      # Original full document (backup)
├── exhibit-*.html                  # Standalone exhibit documents
├── context/                        # Context and reference materials
│   ├── ORIGINAL_SITE/             # Original SEC files (reference)
│   └── PROJECT_SUMMARY.md         # This file
├── data/
│   └── fragments_registry.json    # Fragment metadata (order, pages, titles)
├── static/
│   └── css/                       # Shared and version-specific CSS
│       ├── base.css               # Shared semantic styles (tables, text, spacing)
│       ├── version1.css           # Version 1 (SEC-like) presentation
│       └── version2.css           # Version 2 (enhanced UX) presentation
└── templates/
    ├── menu.html                  # Main menu page
    ├── versions/
    │   ├── version1.html          # Version 1 template
    │   └── version2.html          # Version 2 template
    ├── fragments/                 # Legacy whole-item fragments (still available)
    │   ├── head.html
    │   ├── title_page.html
    │   ├── contents.html
    │   ├── item_1.html
    │   ├── item_2.html
    │   ├── item_3.html
    │   ├── item_4.html
    │   ├── item_5.html
    │   ├── item_6.html
    │   ├── item_7.html
    │   ├── item_8.html
    │   ├── item_9.html
    │   ├── item_10.html
    │   ├── item_11.html
    │   ├── item_12.html
    │   ├── item_13.html
    │   ├── item_14.html
    │   ├── item_15.html
    │   ├── item_16.html
    │   └── closing.html
    └── data/
        └── fragments/             # Normalized content fragments (in progress)
            ├── item_1_general.html
            ├── item_1_business_model.html
            ├── item_8_ntfs_leases.html
            ├── item_8_ntfs_debt.html
            ├── item_8_ntfs_goodwill_intangible_assets.html
            ├── item_8_ntfs_pension_postretirement_benefits.html
            └── ...
```

## Development Workflow

1. **To create a new version**:
   - Copy an existing version template (e.g., `version1.html`)
   - Add version-specific CSS/JavaScript
   - Update `app.py` to handle the new version route
   - Test that content displays correctly

2. **To modify content**:
   - Edit the appropriate fragment in `templates/fragments/`
   - Changes will automatically apply to all versions that include that fragment

3. **To fix styling issues**:
   - Edit `static/styles.css`
   - For version-specific styles, add them to the version template or create version-specific CSS files

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
2. **Respect the fragment structure** - don't duplicate content across versions
3. **Version 1 must remain unchanged** in terms of visual appearance (it's the baseline)
4. **Check both `static/styles.css` and inline styles** when debugging layout issues
5. **Each item (1-16) has its own fragment file** - this makes it much easier to locate and fix issues in specific sections
6. **Table structures use colspan attributes** extensively for layout control
7. **Items 10-14 are typically incorporated by reference** (they refer to the proxy statement) - their fragment files may be minimal or placeholders
8. **The old `part1.html`, `part2.html`, `part3.html`, `part4.html`, and `header.html` files are preserved** but are no longer used in the current version structure - they can be referenced if needed but should not be modified

## Future Enhancements (Planned)

- Floating navigation sidebar
- Page-by-page pagination
- Search functionality
- Print-optimized layouts
- Mobile-responsive versions
- Accessibility improvements
- Interactive data visualizations
- Export to PDF functionality

