# Fragment Architecture Proposal

## Problem Statement
- Need to subdivide into 50-75 fragments
- Version 1 (SEC format) needs page numbers and horizontal lines
- Later versions won't have page numbers
- Currently all CSS is inline - need to separate it
- Content should be reusable across versions

## Solution: Three-Layer Architecture

### Layer 1: Content (Data)
**Location**: `templates/data/fragments/`

- **Pure semantic HTML** - no inline styles, no page numbers
- **CSS classes only** - semantic class names like `.heading-1`, `.paragraph`, `.list-item`
- **Data attributes** for metadata (e.g., `data-page-number="3"`)

**Example fragment structure:**
```html
<section class="fragment" data-fragment-id="item_1_general" data-page-start="2" data-page-end="3">
  <h2 class="section-heading">General</h2>
  <p class="body-text">Illinois Tool Works Inc. (the "Company" or "ITW")...</p>
  <!-- More content -->
</section>
```

### Layer 2: Metadata (Registry)
**Location**: `data/fragments_registry.json` or `fragments.py`

Stores:
- Fragment order
- Page numbers (where page breaks occur)
- Fragment titles
- Parent item relationships
- Navigation metadata

**Example:**
```json
{
  "fragments": [
    {
      "id": "item_1_general",
      "file": "item_1_general.html",
      "title": "General",
      "item": "1",
      "order": 3,
      "page_numbers": [2, 3],
      "page_breaks": [3]
    }
  ]
}
```

### Layer 3: Presentation (Templates + CSS)
**Location**: `templates/versions/` and `static/css/`

- **Version-specific templates** that wrap fragments
- **Version-specific CSS** that handles:
  - Page numbers (show/hide based on version)
  - Styling (inline styles → CSS classes)
  - Page breaks (CSS `page-break-after`)

**Version 1 CSS** (`static/css/version1.css`):
```css
/* Show page numbers */
.fragment[data-page-start]::before {
  content: attr(data-page-start);
  /* Position at bottom of page */
}

/* Show horizontal lines after page numbers */
.fragment[data-page-end]::after {
  content: '';
  border-bottom: 1px solid #000;
  display: block;
  page-break-after: always;
}
```

**Version 2+ CSS** (`static/css/version2.css`):
```css
/* Hide page numbers */
.fragment[data-page-start]::before {
  display: none;
}

/* No horizontal lines */
.fragment[data-page-end]::after {
  display: none;
}
```

## Implementation Strategy

### Step 1: Create CSS Class System
Replace inline styles with semantic classes:
- `style="color:#000000;font-family:'Times New Roman'..."` → `class="body-text"`
- `style="font-weight:700"` → `class="heading-1"` or `class="bold"`
- `style="padding-left:36pt"` → `class="indent-1"`

### Step 2: Extract Page Numbers
- Store page numbers as data attributes: `data-page-start="3"`
- Store page breaks: `data-page-end="3"` (triggers horizontal line)

### Step 3: Fragment Registry
- Create JSON/Python registry with all fragment metadata
- Include page number information

### Step 4: Version Templates
- Each version template includes fragments
- Version-specific CSS handles presentation
- Macros can wrap fragments with version-specific HTML

## Example: Fragment Transformation

**Before (current):**
```html
<div>
 <span style="color:#000000;font-family:'Times New Roman',sans-serif;font-size:10pt;font-weight:700;line-height:120%">
  General
 </span>
</div>
<div>
 <span>
  <br/>
 </span>
</div>
<div>
 <span style="color:#000000;font-family:'Times New Roman',sans-serif;font-size:10pt;font-weight:400;line-height:120%">
  Illinois Tool Works Inc...
 </span>
</div>
<div style="height:45pt;position:relative;width:100%">
 <div style="bottom:0;position:absolute;width:100%">
  <div style="text-align:center">
   <span style="color:#000000;font-family:'Times New Roman',sans-serif;font-size:10pt;font-weight:400;line-height:120%">
    3
   </span>
  </div>
 </div>
</div>
<hr style="page-break-after:always"/>
```

**After (proposed):**
```html
<section class="fragment" data-fragment-id="item_1_general" data-page-start="2" data-page-end="3">
  <h2 class="section-heading">General</h2>
  <p class="body-text">Illinois Tool Works Inc...</p>
</section>
```

**Version 1 CSS renders page numbers:**
```css
.fragment[data-page-end]::after {
  content: '';
  display: block;
  height: 45pt;
  position: relative;
}

.fragment[data-page-end]::after::before {
  content: attr(data-page-end);
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
  /* ... styling ... */
}

.fragment[data-page-end]::after::after {
  content: '';
  border-top: 1px solid #000;
  page-break-after: always;
}
```

**Version 2+ CSS hides them:**
```css
.fragment[data-page-end]::after {
  display: none;
}
```

## Benefits

1. **Content is reusable** - same HTML, different CSS
2. **Easy to manage** - 50-75 fragments in registry
3. **Version-specific styling** - CSS handles differences
4. **Clean separation** - content, metadata, presentation
5. **Maintainable** - change CSS, not HTML

