#!/usr/bin/env python3
"""Clean up HTML files: extract inline styles and format HTML"""

import re
from pathlib import Path
from collections import OrderedDict
try:
    from bs4 import BeautifulSoup
    BEAUTIFUL_SOUP = True
except ImportError:
    BEAUTIFUL_SOUP = False

def extract_unique_styles(content):
    """Extract all unique inline styles"""
    style_pattern = r'style="([^"]*)"'
    styles = re.findall(style_pattern, content)
    unique_styles = OrderedDict()
    
    for style in set(styles):
        if style.strip():
            unique_styles[style] = len(unique_styles) + 1
    
    return unique_styles

def replace_inline_styles(content):
    """Replace inline styles with class references"""
    unique_styles = extract_unique_styles(content)
    
    for style, class_num in unique_styles.items():
        class_name = f'style-{class_num}'
        # Replace all instances of this style
        content = content.replace(f'style="{style}"', f'class="{class_name}"')
    
    # Generate CSS
    css_lines = []
    for style, class_num in unique_styles.items():
        class_name = f'style-{class_num}'
        css_lines.append(f'.{class_name} {{{style}}}')
    
    return content, '\n'.join(css_lines)

def format_html_bs4(content):
    """Format using BeautifulSoup"""
    soup = BeautifulSoup(content, 'html.parser')
    return soup.prettify()

def format_html_simple(content):
    """Simple regex-based formatting"""
    # Fix unescaped entities first
    content = content.replace('&#160;', ' ')
    content = content.replace('&#38;', '&')
    content = content.replace('&#47;', '/')
    content = content.replace('&#59;', ';')
    
    # Add whitespace around tags
    content = re.sub(r'>(?![<>\s])', '>', content)
    content = re.sub(r'(?<![<>\s])<', '<', content)
    
    # Split into lines
    lines = content.split('\n')
    formatted_lines = []
    indent = 0
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        
        # Handle closing tags
        if stripped.startswith('</'):
            indent = max(0, indent - 1)
        
        # Output line
        formatted_lines.append('  ' * indent + stripped)
        
        # Handle opening tags
        if stripped.startswith('<') and not stripped.startswith('</'):
            # Don't increase indent for self-closing or comments
            if not re.search(r'\/>$', stripped) and '<!--' not in stripped:
                indent += 1
    
    return '\n'.join(formatted_lines)

def process_file(input_path):
    """Process a single HTML file"""
    print(f"Processing {input_path.name}...")
    
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace inline styles
    content, css_content = replace_inline_styles(content)
    
    # Format HTML
    if BEAUTIFUL_SOUP:
        try:
            content = format_html_bs4(content)
        except:
            content = format_html_simple(content)
    else:
        content = format_html_simple(content)
    
    # Write back
    with open(input_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return css_content

def main():
    base_dir = Path('.')
    html_files = list(base_dir.glob('*.html'))
    all_css = []
    
    for html_file in html_files:
        css = process_file(html_file)
        if css:
            all_css.append(css)
    
    # Consolidate CSS
    unique_rules = set()
    for css in all_css:
        for rule in css.split('\n'):
            if rule.strip():
                unique_rules.add(rule)
    
    # Write CSS file
    with open('styles.css', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sorted(unique_rules)))
    
    print(f"\nCompleted! Processed {len(html_files)} files.")
    print(f"Created styles.css with {len(unique_rules)} unique CSS rules.")

if __name__ == '__main__':
    main()

