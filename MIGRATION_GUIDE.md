# Migration Guide: From Inline Styles to Semantic HTML

## Overview
This guide explains how to migrate from the current inline-style HTML fragments to semantic HTML with CSS classes.

## Step-by-Step Process

### 1. Extract Fragment Content
Identify the boundaries of each fragment based on your highlighted PDF.

**Example**: Fragment "General" starts at line 18 and ends at line 456 in `item_1.html`.

### 2. Remove Inline Styles
Replace inline `style` attributes with semantic CSS classes.

**Mapping Table:**
| Inline Style | CSS Class |
|-------------|-----------|
| `style="color:#000000;font-family:'Times New Roman',sans-serif;font-size:10pt;font-weight:400;line-height:120%"` | `class="body-text"` |
| `style="color:#000000;font-family:'Times New Roman',sans-serif;font-size:10pt;font-weight:700;line-height:120%"` | `class="heading-1"` |
| `style="color:#000000;font-family:'Times New Roman',sans-serif;font-size:10pt;font-style:italic;font-weight:700;line-height:120%"` | `class="heading-2"` |
| `style="padding-left:36pt"` | `class="indent-1"` |
| `style="padding-left:36pt;text-indent:-18pt"` | `class="list-item"` |

### 3. Remove Page Numbers from Content
Extract page numbers and store them in the fragment registry.

**Before:**
```html
<div style="height:45pt;position:relative;width:100%">
  <div style="bottom:0;position:absolute;width:100%">
    <div style="text-align:center">
      <span>3</span>
    </div>
  </div>
</div>
<hr style="page-break-after:always"/>
```

**After:**
- Remove from HTML
- Add to registry: `"page_numbers": [2, 3], "page_breaks": [3]`
- Version 1 template will render page numbers via CSS

### 4. Simplify HTML Structure
Replace nested `<div><span>` structures with semantic HTML.

**Before:**
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
```

**After:**
```html
<h2 class="section-heading">General</h2>
```

### 5. Update Fragment Registry
Add the new fragment to `data/fragments_registry.json`:

```json
{
  "id": "item_1_general",
  "file": "item_1_general.html",
  "title": "General",
  "item": "1",
  "order": 3,
  "page_numbers": [2, 3],
  "page_breaks": [3]
}
```

### 6. Test Version 1
Ensure Version 1 still looks identical to SEC website:
- Page numbers appear at correct locations
- Horizontal lines appear after page numbers
- All styling matches original

### 7. Test Version 2+
Ensure later versions:
- Don't show page numbers
- Have enhanced UX styling
- Content is still readable

## Tools to Help

### Automated Script
Create a script to:
1. Extract fragments based on line numbers
2. Remove inline styles (replace with classes)
3. Extract page numbers
4. Generate registry entries

### Manual Process
1. Open original fragment
2. Copy content between boundaries
3. Replace inline styles with classes
4. Remove page numbers
5. Save to `templates/data/fragments/`
6. Update registry

## Example: Complete Transformation

**Original (`templates/fragments/item_1.html` lines 16-239):**
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
<!-- ... more content ... -->
<div style="height:45pt;position:relative;width:100%">
  <!-- page number 3 -->
</div>
<hr style="page-break-after:always"/>
```

**New (`templates/data/fragments/item_1_general.html`):**
```html
<h2 class="section-heading">General</h2>
<p class="body-text">Illinois Tool Works Inc...</p>
<!-- ... more content ... -->
<!-- Page number removed - handled by template -->
```

**Registry Entry:**
```json
{
  "id": "item_1_general",
  "file": "item_1_general.html",
  "title": "General",
  "item": "1",
  "order": 3,
  "page_numbers": [2, 3],
  "page_breaks": [3]
}
```

**Version 1 Template Renders:**
- Includes fragment content
- Adds page number div before page break
- Adds horizontal line
- Applies Version 1 CSS

**Version 2 Template Renders:**
- Includes fragment content
- No page number
- No horizontal line
- Applies Version 2 CSS (enhanced UX)

