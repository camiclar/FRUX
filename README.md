# Illinois Tool Works 10-K Interactive Document Viewer

An interactive viewer for the Illinois Tool Works Inc. SEC Form 10-K filing for the year ended December 31, 2024, built with Flask and Jinja2.

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the Flask app
python app.py

# Open http://127.0.0.1:5000 in your browser
```

For detailed setup instructions, see [SETUP.md](SETUP.md)

## 📁 Project Structure

### Flask Application
- **app.py** - Main Flask application
- **requirements.txt** - Python dependencies (just Flask!)

### Templates
- **menu.html** - Beautiful menu to select versions
- **version1.html** - Version 1: Original SEC format (currently available)
- **version2-10.html** - Future versions (coming soon)

### Content Fragments
All content is stored in `templates/fragments/`:
- **head.html** - HTML head section
- **header.html** - Document header
- **contents.html** - Table of contents
- **part1.html** - Part I (Business, etc.)
- **part2.html** - Part II (Financial, etc.)
- *(and more...)*

### Static Assets
- **styles.css** - All document styling

## 🎯 The 10 Versions Plan

- **Version 1** ✅ - Original SEC format (control)
- **Versions 2-9** 🚧 - Each with one unique enhancement
  - Version 2: Floating navigation
  - Version 3: Pagination
  - Version 4: (TBD)
  - etc...
- **Version 10** 🎉 - All enhancements combined

## ✨ Key Features

1. **Modular Content**: HTML split into manageable fragments
2. **Reusable**: Same content, different presentations
3. **Easy Development**: Edit individual fragments, not one huge file
4. **Clean Architecture**: Separate content from presentation
5. **Local Setup**: Runs with just `python app.py`

## 📊 Why This Approach?

The original `index.html` was **28,838 lines long**. By splitting it into fragments:
- ✅ Each fragment is manageable for editing
- ✅ Content can be reused across all 10 versions
- ✅ Easy to maintain and update
- ✅ Clean separation of data and presentation

## 🛠 Technology Stack

- **Flask** - Web framework
- **Jinja2** - Template engine (comes with Flask)
- **HTML/CSS/JavaScript** - Frontend
- **Python** - Backend

## 📝 Changes from Original

1. **Removed XBRL**: All XBRL tags and attributes removed
2. **Extracted CSS**: Inline styles moved to `styles.css`
3. **Semantic Class Names**: Better, meaningful CSS class names
4. **File Naming**: Descriptive exhibit file names
5. **Split Content**: HTML broken into logical fragments
6. **Flask App**: Interactive web application for version management

## 📚 Documentation

- [SETUP.md](SETUP.md) - Detailed setup instructions
- [WHY_SO_LONG.md](WHY_SO_LONG.md) - Why SEC filings are so large

## 🎨 Customization

The beauty of this architecture: **to create Version 2**, just:
1. Copy `version1.html` to `version2.html`
2. Add your floating navigation HTML/JS
3. Update `app.py` to handle version 2
4. Done! Same content, new presentation.
