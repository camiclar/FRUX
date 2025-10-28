#!/usr/bin/env python3
"""Complete cleanup: copy original and properly extract styles"""

import re
from pathlib import Path
from collections import OrderedDict
import shutil

def main():
    # Step 1: Copy original to index.html
    print("Step 1: Copying original file...")
    shutil.copy('original-index.htm', 'index.html')
    
    # Step 2: Read and extract all unique styles
    print("Step 2: Extracting inline styles...")
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract all unique styles
    style_pattern = r'style="([^"]*)"'
    all_styles = re.findall(style_pattern, content)
    unique_styles = OrderedDict()
    
    for i, style in enumerate(set(all_styles), 1):
        if style.strip():
            unique_styles[style] = f'style-{i}'
    
    print(f"Found {len(unique_styles)} unique styles")
    
    # Step 3: Replace inline styles with class references
    print("Step 3: Replacing inline styles with classes...")
    for style, class_name in unique_styles.items():
        content = content.replace(f'style="{style}"', f'class="{class_name}"')
    
    # Step 4: Remove XBRL-specific attributes and tags
    print("Step 4: Removing XBRL elements...")
    # Remove -sec-extract attributes
    content = re.sub(r'\s-sec-extract:[^;>\s]+', '', content)
    
    # Step 5: Add CSS link to head
    print("Step 5: Adding CSS link...")
    if '<head>' in content and '</head>' in content:
        css_link = '\n  <link rel="stylesheet" href="styles.css">'
        content = content.replace('</head>', css_link + '\n</head>')
    
    # Step 6: Update internal links to renamed exhibit files
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
        'a20241231-ex21.htm': 'exhibit-21-subsidiaries.html',
        'a20241231-ex4n.htm': 'केxhibit-4n-debt-registration.html',
    }
    
    for old_link, new_link in link_map.items():
        content = content.replace(f'href="{old_link}"', f'href="{new_link}"')
    
    # Step 7: Write the processed HTML
    print("Step 7: Writing processed HTML...")
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Step 8: Write CSS file
    print("Step 8: Writing CSS file...")
    css_content = '/* SEC Filing Styles - Extracted from inline styles */\n\n'
    for style, class_name in unique_styles.items():
        css_content += f'.{class_name} {{{style}}}\n'
    
    with open('styles.css', 'w', encoding='utf-8') as f:
        f.write(css_content)
    
    print(f"\nComplete! Created:")
    print(f"  - index.html (with class references)")
    print(f"  - styles.css ({len(unique_styles)} unique styles)")

if __name__ == '__main__':
    main()

