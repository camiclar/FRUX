#!/usr/bin/env python3
"""Final cleanup - remove XBRL tags and clean up HTML"""

import re

def remove_xbrl_tags(content):
    """Remove XBRL tags using regex"""
    # Remove opening ix: tags
    content = re.sub(r'<ix:[^>]*>', '', content)
    # Remove closing ix: tags
    content = re.sub(r'</ix:[^>]*>', '', content)
    # Remove self-closing ix: tags
    content = re.sub(r'<ix:[^>]*/>', '', content)
    return content

def remove_xbrl_attributes(content):
    """Remove XBRL-specific attributes"""
    # Remove contextRef, unitRef, etc.
    patterns = [
        r'\scontextRef="[^"]*"',
        r'\sunitRef="[^"]*"',
        r'\sname="[^"]*"',
        r'\sformat="[^"]*"',
        r'\sdecimals="[^"]*"',
        r'\sscale="[^"]*"',
        r'\sid="f-\d+"',
        r'\sescape="[^"]*"',
        r'-sec-extract:[^;>\s]+',
    ]
    
    for pattern in patterns:
        content = re.sub(pattern, '', content)
    
    return content

def main():
    print("Reading original file...")
    with open('original-index.htm', 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("Removing XBRL tags...")
    content = remove_xbrl_tags(content)
    
    print("Removing XBRL attributes...")
    content = remove_xbrl_attributes(content)
    
    # Clean up any remaining malformed references
    content = re.sub(r'&#160;</ix:nonNumeric>', '', content)
    content = re.sub(r'</ix:nonNumeric>', '', content)
    content = re.sub(r'</ix:nonFraction>', '', content)
    content = re.sub(r'</ix:fraction>', '', content)
    content = re.sub(r'</ix:continuation>', '', content)
    content = re.sub(r'</ix:header>', '', content)
    content = re.sub(r'</ix:hidden>', '', content)
    
    # Clean up any orphaned end tags
    content = re.sub(r'</[^>]+ix:[^>]*>', '', content)
    
    print("Writing cleaned index.html...")
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Done! index.html has been cleaned.")

if __name__ == '__main__':
    main()
