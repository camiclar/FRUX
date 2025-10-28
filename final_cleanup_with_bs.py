#!/usr/bin/env python3
"""Final cleanup using BeautifulSoup to properly parse and clean HTML"""

try:
    from bs4 import BeautifulSoup
    bs4_available = True
except ImportError:
    bs4_available = False
    print("BeautifulSoup not available, using fallback method")

import re

def clean_html_bs4(content):
    """Clean HTML using BeautifulSoup"""
    print("Using BeautifulSoup...")
    soup = BeautifulSoup(content, 'html.parser')
    
    # Remove XBRL tags
    for tag_name in ['ix:header', 'ix:hidden', 'ix:nonNumeric', 'ix:nonFraction', 
                     'ix:fraction', 'ix:continuation', 'link:schemaRef', 'xbrli:unit',
                     'xbrli:measure', 'xbrli:divide', 'xbrli:unitNumerator', 'xbrli:unitDenominator']:
        for tag in soup.find_all(tag_name):
            tag.decompose()
    
    # Remove XBRL attributes from remaining tags
    for tag in soup.find_all(True):
        if tag.attrs:
            attrs_to_remove = []
            for attr in tag.attrs:
                if 'contextRef' in attr or 'unitRef' in attr or 'format' in attr or \
                   'decimals' in attr or 'scale' in attr or attr.startswith('id="f-') or \
                   'xbrl' in attr.lower() or 'ix:' in attr or attr.startswith('xlink:'):
                    attrs_to_remove.append(attr)
            for attr in attrs_to_remove:
                del tag[attr]
    
    return str(soup)

def clean_html_regex(content):
    """Clean HTML using regex (fallback)"""
    print("Using regex fallback...")
    
    # Remove XBRL tags
    patterns = [
        r'<ix:[^>]*>.*?</ix:[^>]*>',
        r'<link:schemaRef[^>]*/>',
        r'<xbrli:unit[^>]*>.*?</xbrli:unit>',
        r'<xbrli:measure[^>]*>.*?</xbrli:measure>',
        r'<xbrli:divide[^>]*>.*?</xbrli:divide>',
        r'<xbrli:unitNumerator[^>]*>.*?</xbrli:unitNumerator>',
        r'<xbrli:unitDenominator[^>]*>.*?</xbrli:unitDenominator>',
    ]
    
    for pattern in patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    # Remove XBRL attributes
    content = re.sub(r'\sxlink:[^=]*="[^"]*"', '', content)
    content = re.sub(r'\scontextRef="[^"]*"', '', content)
    content = re.sub(r'\sunitRef="[^"]*"', '', content)
    
    return content

def main():
    print("Reading original file...")
    with open('original-index.htm', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Clean HTML
    if bs4_available:
        content = clean_html_bs4(content)
    else:
        content = clean_html_regex(content)
    
    # Additional cleanup with regex
    content = re.sub(r'<ix:[^>]*/?>', '', content)
    content = re.sub(r'</ix:[^>]*>', '', content)
    
    # Remove any XBRL data remaining in the hidden div
    content = re.sub(r'<div class="hidden-[^"]*">.*?</div>', '', content, flags=re.DOTALL)
    
    print("Writing cleaned index.html...")
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Done!")

if __name__ == '__main__':
    main()


