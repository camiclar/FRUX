#!/usr/bin/env python3
"""
Final cleanup script to:
1. Extract inline styles to CSS classes
2. Format HTML with proper indentation
"""

import re
from pathlib import Path
from collections import OrderedDict
from html.parser import HTMLParser

class HTMLFormatter(HTMLParser):
    def __init__(self):
        super().__init__()
        self.output = []
        self.indent_level = 0
        self.last_tag = None
        
    def handle_starttag(self, tag, attrs):
        # Self-closing tags
        self_closing = ['br', 'hr', 'img', 'input', 'link', 'meta', 'col', 'area', 'base', 'embed']
        
        attrs_str = ' '.join([f'{name}="{value}"' if value else name for name, value in attrs])
        if attrs_str:
            tag_str = f'<{tag} {attrs_str}>'
        else:
            tag_str = f'<{tag}>'
            
        if tag in self_closing:
            self.output.append('  ' * self.indent_level + tag_str)
        else:
            self.output.append('  ' * self.indent_level + tag_str)
            self.indent_level += 1
            
    def handle_endtag(self, tag):
        self.indent_level = max(0, self.indent_level - 1)
        self.output.append('  ' * self.indent_level + f'</{tag}>')
        
    def handle_data(self, data):
        if data.strip():
            self.output.append('  ' * self.indent_level + data.strip())
            
    def handle_decl(self, decl):
        self.output.append('  ' * self.indent_level + f'<!{decl}>')
        
    def handle_comment(self, data):
        self.output.append('  ' * self.indent_level + f'<!-- {data} -->')

def extract_unique_styles(content):
    """Extract all unique inline styles from HTML"""
    style_pattern = r'style="([^"]*)"'
    styles = re.findall(style_pattern, content)
    
    # Get unique styles
    unique_styles = OrderedDict()
    for style in set(styles):
        if style.strip():
            unique_styles[style] = len(unique_styles) + 1
    
    return unique_styles

def replace_inline_styles(content):
    """Replace inline styles with class references"""
    # First pass: find all unique styles
    unique_styles = extract_unique_styles(content)
    
    # Replace each style with a class
    for style, class_num in unique_styles.items():
        escaped_style = re.escape(style)
        class_name = f'style-{class_num}'
        content = content.replace(f'style="{style}"', f'class="{class_name}"')
    
    # Generate CSS
    css_content = []
    for style, class_num in unique_styles.items():
        class_name = f'style-{class_num}'
        css_content.append(f'.{class_name} {{{style}}}')
    
    return content, '\n'.join(css_content)

def format_html_simple(content):
    """Simple HTML formatting"""
    # Add newlines after opening tags
    content = re.sub(r'(<[^/!][^>]*>)', r'\1\n', content)
    # Add newlines before closing tags
    content = re.sub(r'(</[^>]+>)', r'\n\1', content)
    # Add newlines after closing tags
    content = re.sub(r'(</[^>]+>)', r'\1\n', content)
    
    # Split into lines and indent
    lines = content.split('\n')
    formatted = []
    indent = 0
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Decrease indent for closing tags
        if line.startswith('</'):
            indent = max(0, indent - 1)
            
        # Add line with indent
        formatted.append('  ' * indent + line)
        
        # Increase indent for opening tags (not self-closing)
        if line.startswith('<') and not line.startswith('</'):
            if not line.endswith('/>') and '<!--' not in line and '-->' not in line:
                indent += 1
                
    return '\n'.join(formatted)

def process_file(input_path):
    """Process a single HTML file"""
    print(f"Processing {input_path.name}...")
    
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract and replace inline styles
    content, css_content = replace_inline_styles(content)
    
    # Format HTML
    try:
        content = format_html_simple(content)
    except Exception as e:
        print(f"Warning: Could not format {input_path.name}: {e}")
    
    # Write formatted HTML
    with open(input_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return css_content

def main():
    base_dir = Path('.')
    
    # Process all HTML files
    html_files = list(base_dir.glob('*.html'))
    all_css = []
    
    for html_file in html_files:
        css = process_file(html_file)
        if css:
            all_css.append(css)
    
    # Write consolidated CSS file
    # Get unique CSS rules
    unique_css_rules = set()
    for css in all_css:
        for rule in css.split('\n'):
            if rule.strip():
                unique_css_rules.add(rule)
    
    with open('styles.css', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sorted(unique_css_rules)))
    
    print(f"\nDone! Processed {len(html_files)} files and created styles.css with {len(unique_css_rules)} unique rules.")

if __name__ ==跃 '__main__':
    main()

