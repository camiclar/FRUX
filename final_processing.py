#!/usr/bin/env python3
"""Complete final processing: clean original file and extract styles properly"""

import re
from pathlib import Path
from collections import OrderedDict
import shutil

def main():
    print("Starting complete reprocess...")
    
    # Step 1: Copy original
    print("Step 1: Copying original to index.html...")
    shutil.copy('original-index.htm', 'index.html')
    
    # Step 2: Read content
    print("Step 2: Reading content...")
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Step 3: Extract all inline styles with their positions
    print("Step 3: Extracting inline styles...")
    style_pattern = r'style="([^"]*)"'
    matches = re.finditer(style_pattern, content)
    
    unique_styles = OrderedDict()
    counter = 1
    
    # Collect all unique styles
    for match in matches:
        style = match.group(1)
        if style.strip() and style not in unique_styles:
            # Generate semantic name
            semantic_name = generate_semantic_name(style)
            class_name = f'{semantic_name}-{counter}'
            unique_styles[style] = class_name
            counter += 1
    
    print(f"Found {len(unique_styles)} unique styles")
    
    # Step 4: Replace all inline styles with class references
    print("Step 4: Replacing inline styles with classes...")
    for style, class_name in unique_styles.items():
        content = content.replace(f'style="{style}"', f'class="{class_name}"')
    
    # Step 5: Remove XBRL tags
    print("Step 5: Removing XBRL tags...")
    content = re.sub(r'<ix:[^>]*>.*?</ix:[^>]*>', '', content, flags=re.DOTALL)
    content = re.sub(r'<ix:[^>]*/?>', '', content)
    content = re.sub(r'</ix:[^>]*>', '', content)
    content = re.sub(r'<link:schemaRef[^>]*/?>', '', content)
    content = re.sub(r'<xbrli:[^>]*>.*?</xbrli:[^>]*>', '', content, flags=re.DOTALL)
    
    # Step 6: Remove XBRL attributes
    print("Step 6: Removing XBRL attributes...")
    content = re.sub(r'\s-sec-extract:[^;>\s]+', '', content)
    content = re.sub(r'\scontextRef="[^"]*"', '', content)
    content = re.sub(r'\sunitRef="[^"]*"', '', content)
    content = re.sub(r'\sformat="[^"]*"', '', content)
    content = re.sub(r'\sdecimals="[^"]*"', '', content)
    content = re.sub(r'\sscale="[^"]*"', '', content)
    content = re.sub(r'\sid="f-\d+"', '', content)
    content = re.sub(r'\sescape="[^"]*"', '', content)
    content = re.sub(r'\sxlinkfield="[^"]*"', '', content)
    content = re.sub(r'\sxlink:href="[^"]*"', '', content)
    content = re.sub(r'\sxlink:type="[^"]*"', '', content)
    
    # Step 7: Add CSS link
    print("Step 7: Adding CSS link...")
    if '<link rel="stylesheet"' not in content:
        content = content.replace('</head>', '  <link rel="stylesheet" href="styles.css">\n</head>')
    
    # Step 8: Update links
    print("Step 8: Updating internal links...")
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
        'a20241231-ex21.htm': 'exhibit-21-subsidiaries.html',
        'a20241231-ex4n.htm': 'exhibit-4n-debt-registration.html',
    }
    for old_link, new_link in link_map.items():
        content = content.replace(f'href="{old_link}"', f'href="{new_link}"')
    
    # Step 9: Write HTML
    print("Step 9: Writing cleaned HTML...")
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Step 10: Write CSS
    print("Step 10: Writing CSS...")
    css_content = '/* SEC Filing Styles - Extracted from inline styles */\n/* Semantic class names based on style properties */\n\n'
    for style, class_name in unique_styles.items():
        css_content += f'.{class_name} {{{style}}}\n'
    
    with open('styles.css', 'w', encoding='utf-8') as f:
        f.write(css_content)
    
    print("\nComplete! All done.")

def generate_semantic_name(style):
    """Generate meaningful class name from style"""
    parts = []
    if 'font-weight:700' in style or 'font-weight:bold' in style:
        parts.append('bold')
    if 'text-align:center' in style:
        parts.append('center')
    elif 'text-align:right' in style:
        parts.append('right')
    elif 'text-align:left' in style:
        parts.append('left')
    if 'color:#0000ff' in style or 'color:#0000FF' in style:
        parts.append('link')
    if 'text-decoration:underline' in style:
        parts.append('underline')
    if 'font-style:italic' in style:
        parts.append('italic')
    if 'font-size:10pt' in style:
        parts.append('medium')
    elif 'font-size:9pt' in style:
        parts.append('small')
    if 'display:none' in style:
        parts.append('hidden')
    if parts:
        return '-'.join(parts[:3])
    return 'element'

if __name__ == '__main__':
    main()

