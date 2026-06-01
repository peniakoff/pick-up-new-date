# PickUpNewDate

The calendar. It's not complicated. It has to be simple. That's all.

The simple project of calendar written in JavaScript, CSS and HTML. It's also (potentially) Google Material styled. The calendar supports English, Polish and German.
It supports keyboard navigation with left/right arrows, multiple calendar instances on one page and an optional date selection callback.

<strong>If you have any questions or suggestions - look at my GitHub account and contact me!</strong>

## Installation

```bash
npm install pickupnewdate
```

## Usage

### Browser

Build the distributable files first:

```bash
npm run build
```

```html
<div id="calendar"></div>
<link rel="stylesheet" href="dist/pickupnewdate.css">
<script src="dist/pickupnewdate.umd.js"></script>
<script>
    pickUpNewDate("eng", "calendar", {
        onDateSelect: function (date) {
            console.log(date.toISOString());
        }
    });
</script>
```

Supported languages:
- `eng`
- `pl`
- `de`

### ES modules

```js
import { pickUpNewDate } from "pickupnewdate";

pickUpNewDate("eng", "calendar");
```

### CommonJS

```js
const { pickUpNewDate } = require("pickupnewdate");

pickUpNewDate("eng", "calendar");
```

### Next.js / Vue / React (headless integration)

Use the framework-agnostic model generator and render your own UI:

```js
import { getCalendarViewModel } from "pickupnewdate";

const model = getCalendarViewModel(2026, 5, "eng");
```

In SSR/non-browser environments, initialize DOM rendering only on client side, or pass a custom document adapter via `options.document`.

## API Reference

The package exports:

- `pickUpNewDate(lang, area, options)` - creates and renders a calendar instance
- `Calendar` - calendar class for manual instantiation
- `DAY_NAMES`, `MONTH_NAMES`, `LABELS` - language-specific labels and names
- `isLeapYear(year)` - Gregorian leap year helper
- `getDaysInMonth(year, month)` - month length helper
- `getMonthGrid(year, month)` - Monday-first calendar grid builder
- `getCalendarViewModel(year, month, lang)` - headless data model for framework rendering
- `resolveLanguage(lang)` - returns a supported language code or falls back to `eng`

## Security and data integrity

- Input validation rejects invalid `year` and `month` values with explicit errors.
- Internal language dictionaries (`DAY_NAMES`, `MONTH_NAMES`, `LABELS`) are deep-frozen to prevent runtime mutation.
- Rendering uses safe DOM APIs (`textContent`, `setAttribute`) and does not use `innerHTML`.

## Testing

Build the package with:

```bash
npm run build
```

Run the automated tests with:

```bash
npm test
```

To verify the generated artifacts as well:

```bash
npm run test:build
```
