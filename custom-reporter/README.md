# Custom Playwright Dashboard Reporter

This directory contains the source files for the custom Playwright test dashboard with a modern, visually appealing UI design.

## Files

- **dashboard-template.html**: Main HTML template for the dashboard
- **dashboard-styles.css**: Modern CSS styles with responsive design
- **data-parser.js**: JavaScript class for parsing Playwright test results
- **reporter.js**: Main dashboard logic for rendering and interactions

## Features

### KPI Cards
- Total tests count
- Passed tests (with percentage)
- Failed tests (with percentage)
- Skipped tests (with percentage)
- Overall pass rate with progress bar
- Total and average duration

### Charts
- **Donut Chart**: Test status distribution (Passed/Failed/Skipped)
- **Bar Chart**: Tests per suite comparison

### Test Results Table
- Sortable columns (Name, Suite, Status, Duration)
- Filterable by status (All, Passed, Failed, Skipped)
- Searchable by test name or suite
- Detailed view modal for each test
- Color-coded status badges

## How It Works

1. **Playwright runs tests** → Generates `test-results.json` (JSON reporter)
2. **Build script runs** → Copies files to `custom-report/` directory
3. **Dashboard loads** → Parses JSON data and renders visualizations

## Usage

### Generate Dashboard After Tests
```bash
npm run test:dashboard
```

### Build Dashboard from Existing Results
```bash
npm run dashboard:build
```

### Open Dashboard
```bash
npm run dashboard
```

Or directly open: `custom-report/index.html`

## Customization

### Colors
Edit `dashboard-styles.css` CSS variables:
```css
:root {
    --color-primary: #3b82f6;
    --color-success: #10b981;
    --color-danger: #ef4444;
    --color-warning: #f59e0b;
    /* ... more colors ... */
}
```

### Metrics
Add or modify KPI cards in `dashboard-template.html` and update calculations in `reporter.js`.

### Charts
Modify chart configurations in the `renderCharts()` function in `reporter.js`.

## Technologies

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Grid, Flexbox, CSS Variables
- **Vanilla JavaScript**: No framework dependencies
- **Chart.js** (CDN): For data visualization
- **Font Awesome** (CDN): For icons

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (responsive design)

## Notes

- Dashboard uses mock data if `test-results.json` is not found
- All external resources (Chart.js, Font Awesome) are loaded via CDN
- Dashboard is completely static - no server required
- Works offline once resources are cached
- XSS protection implemented for dynamic content

## Troubleshooting

### Dashboard shows mock data
- Make sure tests have run at least once: `npm test`
- Check that `test-results.json` exists in project root
- Run `npm run dashboard:build` to rebuild

### Charts not displaying
- Check browser console for JavaScript errors
- Ensure CDN resources (Chart.js) can load
- Try refreshing the page

### Styling issues
- Clear browser cache
- Check that `dashboard-styles.css` is present in `custom-report/`
- Verify CSS file copied correctly: `npm run dashboard:build`
