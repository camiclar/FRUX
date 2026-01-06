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

FRAGMENTS = load_fragments()

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
        # Use test template if fragments exist, otherwise use original
        if fragments:
            return render_template('version1_test.html', fragments=fragments)
        else:
            return render_template('version1.html')
    elif version == 2:
        # Version 2 test - no page numbers
        if fragments:
            return render_template('version2_test.html', fragments=fragments)
        else:
            return f"Version {version} requires fragments. Please set up fragments first.", 404
    else:
        return f"Version {version} coming soon!", 404

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

