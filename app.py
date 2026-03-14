#!/usr/bin/env python3
"""Flask app to serve the 10-K document in different versions"""

from flask import Flask, render_template
import json
from pathlib import Path

app = Flask(__name__)

# Load fragment registry
def load_fragments():
    """Load fragments from registry - call this to reload after changes"""
    REGISTRY_PATH = Path('data/fragments_registry.json')
    if REGISTRY_PATH.exists():
        with open(REGISTRY_PATH, 'r', encoding='utf-8') as f:
            registry_data = json.load(f)
            return sorted(registry_data['fragments'], key=lambda x: x['order'])
    return []


def build_item_pages(fragments):
    """
    Group fragments into logical pages for Version 2.

    Rules:
    - Title page and table of contents each get their own page.
    - Each distinct `item` value (e.g. "1", "1A", "2") becomes one page
      containing all fragments with that item, in registry order.
    - Fragments without an item that are not title/ToC are appended to
      the previous page, if any.
    """
    pages = []
    current_item = None
    current_page = None

    # Helper: items that should be grouped together on one Part III page
    part_iii_items = {"10", "11", "12", "13", "14"}

    for frag in fragments:
        frag_id = frag.get("id")
        item = frag.get("item")
        title = frag.get("title")

        if frag_id in ("title_page", "table_of_contents", "part_iv"):
            # Special standalone pages
            if frag_id == "title_page":
                label = "Title Page"
            elif frag_id == "table_of_contents":
                label = "Table of Contents"
            else:
                # For PART IV, keep the fragment title but show just "Part IV" in nav labels
                label = "Part IV"
            pages.append(
                {
                    "id": frag_id,
                    "label": label,
                    "type": "special",
                    "fragment_ids": [frag_id],
                }
            )
            current_item = None
            current_page = None
        elif item:
            # Special case: Part III items 10–14 should all share one page
            if item in part_iii_items:
                if current_item in part_iii_items and current_page is not None:
                    # Continue the existing Part III page (items 10–14)
                    current_page["fragment_ids"].append(frag_id)
                else:
                    # Start the Part III items page with the first of 10–14
                    current_item = item
                    current_page = {
                        "id": frag_id,
                        "item": item,  # keep the first item's number for labeling (e.g., "10")
                        "label": title or f"Item {item}",
                        "type": "item",
                        "fragment_ids": [frag_id],
                    }
                    pages.append(current_page)
            else:
                # Default: each distinct item value gets its own page
                if current_item == item and current_page is not None:
                    current_page["fragment_ids"].append(frag_id)
                else:
                    current_item = item
                    current_page = {
                        "id": frag_id,
                        "item": item,
                        "label": title or f"Item {item}",
                        "type": "item",
                        "fragment_ids": [frag_id],
                    }
                    pages.append(current_page)
        else:
            # Fallback: attach miscellaneous fragments to the previous page
            if pages:
                pages[-1]["fragment_ids"].append(frag_id)
            else:
                pages.append(
                    {
                        "id": frag_id,
                        "label": title or frag_id,
                        "type": "misc",
                        "fragment_ids": [frag_id],
                    }
                )

    return pages

@app.route('/')
def index():
    """Main menu to select version"""
    return render_template('menu.html')

@app.route('/version/<int:version>')
def view_version(version):
    """Display a specific version of the 10-K"""
    # Reload fragments on each request (in debug mode) to pick up changes
    fragments = load_fragments()
    
    if version == 1:
        return render_template('version1.html', fragments=fragments)
    elif version == 2:
        if fragments:
            pages = build_item_pages(fragments)
            return render_template('version2.html', fragments=fragments, pages=pages)
        return f"Version {version} requires fragments. Please set up fragments first.", 404
    else:
        return f"Version {version} not available. Only versions 1 and 2 are supported.", 404

@app.route('/version/3a')
def view_version_3a():
    """Display Version 3A of the 10-K (based on Version 2 with custom labels and breadcrumbs)"""
    fragments = load_fragments()
    if not fragments:
        return "Version 3A requires fragments. Please set up fragments first.", 404
    pages = build_item_pages(fragments)
    return render_template('version3a.html', fragments=fragments, pages=pages)

if __name__ == '__main__':
    print("=" * 60)
    print("Illinois Tool Works 10-K Document Viewer")
    print("=" * 60)
    print("\nStarting Flask server...")
    print("Visit: http://127.0.0.1:5000")
    print("\nPress Ctrl+C to stop")
    print("=" * 60)
    # Use environment variable for port in production, default to 5000 for local
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

