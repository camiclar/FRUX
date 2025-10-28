#!/usr/bin/env python3
"""Complete fix - properly extract styles and create semantic CSS"""

import re
import shutil
from collections import OrderedDict

def generate_semantic_name(style):
    """Create a meaningful class name from the style"""
    parts = []
    
    # Check for common patterns
    if 'font-weight:700' in style or 'font-weight:bold' in style:
        parts.append('bold')
    elif 'font-weight:400' in style or 'font-weight:normal' in style:
        parts.append('normal')
    
    if 'text-align:center' in style:
        parts.append('center')
    elif 'text-align:right' in style:
        parts.append('right')
    elif 'text-align:left' in style:
        parts.append('left')
    elif 'text-align:justify' in style:
        parts.append('justify')
    
    if 'color:#0000ff' in style or 'color:#0000FF' in style:
        parts.append('link')
    elif 'color:#000000' in style or 'color:#000' in style or 'color:black' in style:
        parts.append('black')
    
    if 'text-decoration:underline' in style:
        parts.append('underline')
    
    if 'font-style:italic' in style:
        parts.append('italic')
    
    # Font size
    if 'font-size:9pt' in style:
        parts.append('small')
    elif 'font-size:10pt' in style:
        parts.append('medium')
    elif 'font-size:7.25pt' in style or 'font-size:7pt' in style:
        parts.append('tiny')
    elif 'font-size:8pt' in style:
        parts.append('xsmall')
    elif 'font-size:12pt' in style or 'font-size:14pt' in style:
        parts.append('large')
    
    # Background color
    if 'background-color:#cceeff' in style:
        parts.append('highlighted')
    elif 'background-color:#ffffff' in style or 'background-color:#fff' in style:
        parts.append('white')
    
    # Common layout patterns
    if 'display:none' in style:
        parts.append('hidden')
    
    if 'position:absolute' in style:
        parts.append('absolute')
    elif 'position:relative' in style:
        parts.append('relative')
    
    if 'border-bottom:3pt double' in style:
        parts.append('double-border')
    elif 'border-bottom:0.5pt' in style:
        parts.append('border-bottom')
    
    if 'vertical-align:top' in style:
        parts.append('vtop')
    elif 'vertical-align:bottom' in style:
        parts.append('vbottom')
    
    # Combine parts or use generic name
    if parts:
        name = '-'.join(parts[:5])  # Limit to 5 parts
    else:
        name = 'element'
    
    return name

def main():
    # Step 1: Copy original
    print("Step 1: Copying original file...")
    shutil.copy('original-index.htm', 'index.html')
    
    # Step 2: Extract all unique styles
    print("Step 2: Extracting inline styles...")
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    style_pattern = r'style="([^"]*)"'
    all_styles = re.findall(style_pattern, content)
    
    unique_styles = OrderedDict()
    class_name_map = {}
    counter = 1
    
    for style in set(all_styles):
        if style.strip():
            semantic_name = generate_semantic_name(style)
            class_name = f'{semantic_name}-{counter}'
            unique_styles[style] = class_name
            class_name_map[semantic_name] = class_name_map.get(semantic_name, 0) + 1
            counter += 1
    
    print(f"Found {len(unique_styles)} unique styles")
    
    # Step 3: Replace inline styles with class references
    print("Step 3: Replacing inline styles with classes...")
    for style, class_name in unique_styles.items():
        content = content.replace(f'style="{style}"', f'class="{class_name}"')
    
    # Step 4: Remove XBRL tags
    print("Step 4: Removing XBRL elements...")
    content = re.sub(r'<ix:[^>]*>', '', content)
    content = re.sub(r'</ix:[^>]*>', '', content)
    content = re.sub(r'&#160;</ix:nonNumeric>', '', content)
    content = re.sub(r'</ix:nonNumeric>', '', content)
    content = re.sub(r'</ix:nonFraction>', '', content)
    content = re.sub(r'</ix:fraction>', '', content)
    content = re.sub(r'</ix:continuation>', '', content)
    content = re.sub(r'</ix:header>', '', content)
    content = re.sub(r'</ix:hidden>', '', content)
    
    # Remove XBRL attributes
    content = re.sub(r'\s-sec-extract:[^;>\s]+', '', content)
    content = re.sub(r'\scontextRef="[^"]*"', '', content)
    content = re.sub(r'\sunitRef="[^"]*"', '', content)
    content = re.sub(r'\sformat="[^"]*"', '', content)
    content = re.sub(r'\sdecimals="[^"]*"', '', content)
    content = re.sub(r'\sscale="[^"]*"', '', content)
    content = re.sub(r'\sid="f-\d+"', '', content)
    content = re.sub(r'\sescape="[^"]*"', '', content)
    
    # Step 5: Add CSS link
    print("Step 5: Adding CSS link...")
    if '<link rel="stylesheet" href="styles.css">' not in content:
        content = content.replace('</head>', '  <link rel="stylesheet" href="styles.css">\n</head>')
    
    # Step 6: Update internal links
    print("Step 6: Updating internal links...")
    link_map = {
        'a20241231-ex23.htm': 'exhibit-23-auditor-consent.html',
        'a20241231-ex24.htm': 'exhibit-24-powers-of-attorney.html',
        'a20241231-ex31.htm': 'exhibit-31-ceo-cfo-certifications.html',
        'a20241231-ex32.htm': 'exhibit-32-sarbanes-oxley-certifications.html',
        'a20241231-ex97.htm': 'exhibit-97-clawback-policy.html',
        'a20241231-ex10m.htm': 'exhibit-10m-benefit-plan.html',
        'a20241231-ex10n.htm': 'exhibit-10n-benefit-plan.html',
        'a20241231-ex10o.htm': 'exhibit-10o-benefit-plan.html',
        'a20241231-ex19.htm': 'exhibit-19-financial-code-of-ethics.html',
        'a20241231-ex21.htm': 'になります21-subsidiaries.html',
        'a20241231-ex4n.htm': 'exhibit-4n-debt-registration.html',
    }
    
    for old_link, new_link in link_map.items():
        content = content.replace(f'href="{old_link}"', f'href="{new_link}"')
    
    # Step 7: Write HTML
    print("Step 7: Writing processed HTML...")
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Step 8: Write CSS
    print("Step 8: Writing CSS file...")
    css_content = '/* SEC Filing Styles - Extracted from inline styles */\n/* Semantic class names based on style properties */\n\n'
    for style, class_name in unique_styles.items():
        css_content += f'.{class_name} {{{style}}}\n'
    
    with open('styles.css', 'w', encoding='utf-8') as f:
        f.write(css_content)
    
    print(f"\nComplete! Created:")
    print(f"  - index.html (with class references and semantic names)")
    print(f"  - styles.css ({len(unique_styles)} unique styles with semantic names)")

if __name__ == '__main__':
    main()

