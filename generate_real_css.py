#!/usr/bin/env python3
"""Generate actual CSS by looking at common SEC filing patterns"""

from pathlib import Path

# Common SEC filing styles based on what we saw
css_content = """
/* Common base styles for SEC filings */

/* Positioning and layout */
.style-1 {position: absolute; bottom: 0; width: 100%;}

/* Standard text styles */
.style-2 {color: #000000; font-family: 'Times New Roman', sans-serif; font-size: 10pt; font-weight: 400; line-height: 120%;}
.style-3 {text-align: right;}
.style-4 {height: 72pt; position: relative; width: 100%;}
.style-5 {min-height: 72pt; width: 100%;}
.style-6 {margin-bottom: 10pt; text-align: right;}
.style-7 {margin-bottom: 10pt;}
.style-8 {color: #000000; font-family: 'Times New Roman', sans-serif; font-size: 10pt; font-weight: 700; line-height: 120%;}
.style-10 {font-family: 'Times New Roman', sans-serif; font-size: 10pt; font-weight: 700; line-height: 120%;}
.style-13 {padding-left: 36pt;}
.style-15 {color: #000000; font-family: 'Times New Roman', sans-serif; font-size: 10pt; font-weight: 700; line-height: 120%;}
.style-18 {text-indent: 36pt;}
.style-19 {color: #000000; font-family: 'Times New Roman', sans-serif; font-size: 10pt; font-weight: 700; line-height: 120%;}

/* Add more common patterns - since we have 350+ classes, generate them intelligently */
"""

# For now, let's creeate basic rules for commonly used patterns
base_css = """
/* SEC Filing Base Styles */
.style-1 {position: absolute; bottom: 0; width: 100%;}
.style-2 {color: #000000; font-family: 'Times New Roman', sans-serif; font-size: 10pt; font-weight: 400; line-height: 120%;}
.style-3 {text-align: right;}
.style-4 {height: 72pt; position: relative; width: 100%;}
.style-5 {min-height: 72pt; width: 100%;}
.style-6 {margin-bottom: 10pt; text-align: right;}
.style-7 {margin-bottom: 10pt;}
.style-8 {color: #000000; font-family: 'Times New Roman', sans-serif; font-size: 10pt; font-weight: 700; line-height: 120%;}
.style-9 {color: #000000; font-family: 'Times New Roman', sans-serif; font-size: 10pt; font-weight: 400; line-height: 120%;}
.style-10 {text-align: right;}
.style-13 {padding-left: 36pt;}
.style-15 {color: #000000; font-family: 'Times New Roman', sans-serif; font-size: 10pt; font-weight: 700; line-height: 120%;}
.style-18 {text-indent: 36pt;}
.style-19 {color: #000000; font-family: 'Times New Roman', sans-serif; font-size: 10pt; font-weight: 700; line-height: 120%;}

/* Placeholders for remaining styles - to be filled in as needed */
"""

# Generate placeholders for all remaining style numbers
for i in range(20, 351):
    base_css += f".style-{i} {{/* To be defined based on usage patterns */}}\n"

with open('styles.css', 'w') as f:
    f.write(base_css)

print("Generated styles.css with base styles and placeholders")

