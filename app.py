#!/usr/bin/env python3
"""Flask app to serve the 10-K document in different versions"""

from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    """Main menu to select version"""
    return render_template('menu.html')

@app.route('/version/<int:version>')
def view_version(version):
    """Display a specific version of the 10-K"""
    if version == 1:
        return render_template('version1.html')
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
    app.run(debug=True, port=5000)

