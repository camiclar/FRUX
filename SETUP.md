# Setup Instructions

## Quick Start

### 1. Install Python (if not already installed)
Make sure you have Python 3.8 or higher installed.

### 2. Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python app.py
```

### 5. Open in Browser
Visit: http://127.0.0.1:5000

## Project Structure

```
FRUX/
├── app.py                      # Flask application
├── requirements.txt             # Python dependencies
├── index.html                  # Original full document (backup)
├── styles.css                  # All CSS styles
├── templates/
│   ├── menu.html              # Main menu page
│   ├── version1.html          # Version 1 template
│   └── fragments/
│       ├── head.html          # HTML head section
│       ├── header.html        # Document header
│       ├── contents.html      # Table of contents
│       ├── part1.html         # Part I content
│       ├── part2.html         # Part II content (etc.)
│       └── closing.html       # Closing HTML tags
└── static/
    └── styles.css             # CSS file (copied)
```

## How It Works

1. **Content Storage**: The original HTML was split into fragments stored in `templates/fragments/`
2. **Templates**: Jinja2 templates in `templates/` reassemble fragments
3. **Versions**: Each version (version1.html, version2.html, etc.) uses the **same content fragments** but with different layouts/styling
4. **Menu**: The main menu (`/`) lets users select which version to view

## Adding New Versions

To add Version 2 (with floating navigation):

1. Create `templates/version2.html`
2. Include the same fragments:
```html
{% include 'fragments/head.html' %}
{% include 'fragments/header.html' %}
...
```
3. Add custom CSS/JavaScript for floating nav
4. Update `app.py` to handle version 2

The content stays the same - only the presentation changes!

## Troubleshooting

**Port 5000 already in use?**
Edit `app.py` and change `port=5000` to `port=5001`

**Can't see styling?**
Make sure `styles.css` is in the `static/` folder and the Flask app is running.

