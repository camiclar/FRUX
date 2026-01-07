# Fragment Architecture Summary

## The Problem
- Need 50-75 fragments (currently ~20)
- Version 1 must match SEC website exactly (with page numbers)
- Later versions won't have page numbers
- Currently all CSS is inline - need separation
- Content should be reusable across versions

## The Solution: Three-Layer Architecture

### 1. Content Layer (`templates/data/fragments/`)
**Pure semantic HTML** - no inline styles, no page numbers

**Example:**
```html
<h2 class="section-heading">General</h2>
<p class="body-text">Illinois Tool Works Inc...</p>
```

**Key Points:**
- Use CSS classes, not inline styles
- No page numbers in HTML
- Semantic HTML structure
- Content is version-agnostic

### 2. Metadata Layer (`data/fragments_registry.json`)
**Stores fragment information:**
- Order
- Page numbers (where they appear)
- Page breaks (where horizontal lines go)
- Titles, item relationships

**Example:**
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

### 3. Presentation Layer (`templates/` + `static/css/`)
**Version-specific templates and CSS**

**Version 1 Template:**
- Includes fragments
- Renders page numbers (from registry)
- Renders horizontal lines
- Uses `version1.css`

**Version 2+ Templates:**
- Includes fragments
- No page numbers
- Enhanced UX styling
- Uses `version2.css`

## How Page Numbers Work

### In Content (Fragment)
```html
<!-- NO page numbers here -->
<h2 class="section-heading">General</h2>
<p class="body-text">Content...</p>
```

### In Registry
```json
{
  "page_breaks": [3]  // Page 3 ends here
}
```

### In Version 1 Template
```jinja2
{% include 'data/fragments/' + fragment.file %}
{% if fragment.page_breaks %}
  <div class="page-number">
    <div class="page-number-content">{{ fragment.page_breaks[-1] }}</div>
  </div>
  <hr class="page-break page-break-line"/>
{% endif %}
```

### In Version 1 CSS
```css
.page-number {
  height: 45pt;
  position: relative;
  width: 100%;
}

.page-number-content {
  position: absolute;
  bottom: 0;
  text-align: center;
  /* ... styling ... */
}

.page-break-line {
  border-top: 1px solid #000;
  page-break-after: always;
}
```

### In Version 2 CSS
```css
.page-number {
  display: none;  /* Hide page numbers */
}

.page-break-line {
  display: none;  /* Hide horizontal lines */
}
```

## Migration Process

1. **Extract fragment** from current HTML (lines 18-456)
2. **Remove inline styles** → Replace with CSS classes
3. **Remove page numbers** → Store in registry
4. **Save to** `templates/data/fragments/item_1_general.html`
5. **Update registry** with page number info
6. **Test Version 1** - should match SEC site
7. **Test Version 2** - no page numbers, enhanced UX

## Benefits

✅ **Content is reusable** - Same HTML, different CSS  
✅ **Easy to manage** - 50-75 fragments in one registry  
✅ **Version-specific styling** - CSS handles differences  
✅ **Clean separation** - Content, metadata, presentation  
✅ **Maintainable** - Change CSS, not HTML  
✅ **Scalable** - Easy to add new versions  

## File Structure

```
FRUX/
├── data/
│   └── fragments_registry.json      # Metadata
├── templates/
│   ├── data/
│   │   └── fragments/
│   │       ├── item_1_general.html      # Clean content
│   │       ├── item_1_business_model.html
│   │       └── ...
├── templates/
│   ├── versions/
│   │   ├── version1.html            # SEC format
│   │   └── version2.html            # Enhanced UX
│   └── macros/
│       └── fragment_macros.html    # Rendering helpers
└── static/
    └── css/
        ├── base.css                 # Shared styles
        ├── version1.css             # SEC format styles
        └── version2.css             # Enhanced UX styles
```

## Next Steps

1. Create `templates/data/fragments/` directory
2. Start migrating fragments one by one
3. Update registry as you go
4. Test each fragment in Version 1
5. Verify Version 2 hides page numbers correctly

