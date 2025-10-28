# Illinois Tool Works 10-K Filing

This is a cleaned-up version of the Illinois Tool Works Inc. SEC Form 10-K filing for the year ended December 31, 2024.

## Structure

- **index.html** - Main filing document
- **styles.css** - Consolidated CSS styles
- **exhibit-*.html** - Individual exhibits:
  - `exhibit-4n-debt-registration.html` - Debt registration
  - `exhibit-10m-benefit-plan.html` - Benefit plan document
  - `exhibit-10n-benefit-plan.html` - Benefit plan document
  - `exhibit-10o-benefit-plan.html` - Benefit plan document
  - `exhibit-19-financial-code-of-ethics.html` - Code of ethics
  - `exhibit-21-subsidiaries.html` - Subsidiary list
  - `exhibit-23-auditor-consent.html` - Auditor consent
  - `exhibit-24-powers-of-attorney.html` - Powers of attorney
  - `exhibit-31-ceo-cfo-certifications.html` - CEO/CFO certifications
  - `exhibit-32-sarbanes-oxley-certifications.html` - Sarbanes-Oxley certifications
  - `exhibit-97-clawback-policy.html` - Clawback policy

## Changes Made

1. **Removed XBRL**: All XBRL (eXtensible Business Reporting Language) tags, attributes, and data have been removed
2. **Extracted CSS**: All inline styles extracted to `styles.css` with semantic class names based on style properties (e.g., `bold-medium-4`, `center-3`, `hidden-1`)
3. **Renamed Files**: Files renamed with descriptive names like `exhibit-31-ceo-cfo-certifications.html`
4. **File Extensions**: Changed from `.htm` to `.html`
5. **Removed XML Files**: All XBRL XML schema files removed
6. **Organized Structure**: Clean, web-ready file structure

## Note

The visual appearance has been preserved - when viewing `index.html` in a browser, it should look identical to the original SEC filing. All styling is now in `styles.css` using semantic class names for easier modification.

