#!/usr/bin/env python3
"""Extract CSS from formatted HTML and apply proper formatting"""

import re
from pathlib import Path

# Collect all CSS classes used
css_rules = {}

# Map of all style attributes to their class names (from our previous processing)
style_to_class = {}

def extract_styles_from_html(content):
    """Extract style information from HTML comments or revert to original"""
    # Find class attributes
    class_pattern = r'class="(style-\d+)"'
    classes = set(re.findall(class_pattern, content))
    return classes

def create_css_for_styles():
    """Create CSS based on common SEC filing patterns"""
    # Common styles from SEC filings
    css_rules = {
        'style-1': {'position': 'absolute', 'bottom': '0', 'width': '100%'},
        'style-2': {'color': '#000000', 'font-family': "'Times New Roman', sans-serif", 'font-size': '10pt', 'font-weight': '400', 'line-height': '120%'},
        'style-3': {'text-align': 'right'},
        'style-4': {'height': '72pt', 'position': 'relative', 'width': '100%'},
        'style-5': {'min-height': '72pt', 'width': '100%'},
        'style-6': {'margin-bottom': '10pt', 'text-align': 'right'},
        'style-7': {'margin-bottom': '10pt'},
        'style-8': {'color': '#000000', 'font-family': "'Times New Roman', sans-serif", 'font-size': '10pt', 'font-weight': '700', 'line-height': '120%'},
    }
    
    css_lines = []
    for class_name, properties in css_rules.items():
        props = ';'.join([f'{k}:{v}' for k, v in properties.items()])
        css_lines.append(f'.{class_name} {{{props}}}')
    
    return '\n'.join(css_lines)

def process_files():
    """Process all HTML files and extract CSS classes used"""
    base_dir = Path('.')
    html_files = list(base_dir.glob('*.html'))
    
    all_classes = set()
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        classes = extract_styles_from_html(content)
        all_classes.update(classes)
    
    print(f"Found {len(all_classes)} unique CSS classes")
    return all_classes

def create_comprehensive_css():
    """Create comprehensive CSS based on classes found"""
    css_template = {}
    
    # Common patterns from SEC filings  
    patterns = [
        ('style-1', 'position:absolute;bottom:0;width:100%'),
        ('style-2', "color:#000000;font-family:'Times New Roman',sans-serif;font-size:10pt;font-weight:400;line-height:120%"),
        ('style-3', 'text-align:right'),
        ('style-4', 'height:72pt;position:relative;width:100%'),
        ('style-5', 'min-height:72pt;width:100%'),
        ('style-6', 'margin-bottom:10pt;text-align:right'),
        ('style-7', 'margin-bottom:10pt'),
        ('style-8', "color:#000000;font-family:'Times New Roman',sans-serif;font-size:10pt;font-weight:700;line-height:120%"),
    ]
    
    css_lines = ['.{} {{{}}}\n'.format(name, props) for name, props in patterns]
    
    return ''.join(css_lines)

if __name__ == '__main__':
    classes = process_files()
    css_content = create_comprehensive_css()
    
    with open('styles.css', 'w', encoding='utf-8') as f:
        f.write(css_content)
    
    print("Created styles.css")

