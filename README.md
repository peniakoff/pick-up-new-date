# PickUpNewDate

[![npm version](https://img.shields.io/npm/v/pickupnewdate.svg)](https://www.npmjs.com/package/pickupnewdate)
[![CI](https://github.com/peniakoff/pick-up-new-date/actions/workflows/ci.yml/badge.svg)](https://github.com/peniakoff/pick-up-new-date/actions/workflows/ci.yml)

The calendar. It's not complicated. It has to be simple. That's all.

Lightweight **monthly date picker** written in TypeScript, CSS and HTML with **macOS-inspired** styling, **light/dark mode** (system-aware), and CSS design tokens. Supports English, Polish and German, keyboard navigation, accessibility features, and headless integration for React, Vue, or Next.js.

**If you have any questions or suggestions — look at my GitHub account and contact me!**

## Features

### Calendar view and navigation

- **Month grid** — Monday-first week layout (`getMonthGrid`, `getCalendarViewModel`)
- **Previous / next month** — header buttons and keyboard arrows
- **Year bounds** — navigation limited to years **1–9999**; buttons disabled at min/max
- **Today** — highlighted day with `aria-current="date"`
- **Weekends** — Saturday and Sunday cells styled differently (`.pun-saturday`, `.pun-sunday`)
- **Multiple instances** — call `pickUpNewDate()` several times for separate widgets on one page

### Date selection

- **`onDateSelect(date)`** — callback when a day is clicked (local `Date` object)
- **`initialDate`** — open on a given month and pre-select that day
- **Selected state** — visible highlight (`.pun-selected`) and `aria-selected="true"`
- **`getSelectedDate()`** — read the current selection (`null` if none)
- **`goToDate(year, month, day?)`** — jump to a month; optionally select a day and fire `onDateSelect`
- **`minDate` / `maxDate`** — block selection and month navigation outside the allowed range
- **`disabledDates`** — exclude specific calendar days from selection
- **`disabledDaysOfWeek`** — exclude weekdays (`0` = Sunday … `6` = Saturday, same as `Date.getDay()`)
- **`firstDayOfWeek`** — grid and header start day (`1` = Monday default; `0` = Sunday for US layouts)

### Instance lifecycle and events

- **`destroy()`** — remove listeners and clear the mount element
- **`onMonthChange(year, month)`** — fired after month navigation (`prevMonth` / `nextMonth` / `goToDate`)

### Internationalization

- Built-in languages: **`eng`**, **`pl`**, **`de`**
- **`resolveLanguage(lang)`** — normalizes language code; unsupported values fall back to `eng` (with a console warning)
- Exported constants: `DAY_NAMES`, `MONTH_NAMES`, `LABELS`

### Headless / framework usage

- **`getCalendarViewModel(year, month, lang?, options?)`** — frozen view model (weeks, labels, month name) for custom UI in React, Vue, Next.js, etc.; pass `{ firstDayOfWeek }` when the week does not start on Monday
- **`isDaySelectable(year, month, day, constraints?)`** — whether a day passes `minDate` / `maxDate` / disabled rules (for headless UI)
- **`compareDateOnly(a, b)`** — compare two `Date` values by calendar day only
- **`isLeapYear`**, **`getDaysInMonth`**, **`canNavigateToMonth`** — date helpers with input validation
- **`options.document`** — inject a minimal DOM adapter for SSR or Node tests

### Accessibility

- ARIA: `role="grid"`, labels on navigation and day buttons, hidden caption for screen readers
- **`aria-live="polite"`** region announces the current month when it changes
- **Keyboard**: ← / → change month (including when focus is on a day button); arrow keys move focus between days in the grid
- **`:focus-visible`** styles on interactive controls
- **`prefers-reduced-motion`** — transitions disabled when the user prefers reduced motion

### Security and data integrity

- Year and month validated with explicit `RangeError` messages
- Language dictionaries deep-frozen (`deepFreeze`) to prevent accidental mutation
- DOM built with **`textContent`** and **`setAttribute`** only (no `innerHTML`)

### Theming (v2)

- **CSS variables** on `.pun-root` (`--pun-accent`, `--pun-surface`, weekend tokens, …) — override without forking the stylesheet
- **Light / dark / auto** — `options.theme` (`"auto"` follows `prefers-color-scheme`; `"light"` / `"dark"` set `data-pun-theme` on the mount node)
- **Namespaced classes** — `pun-` prefix avoids collisions with Tailwind, shadcn, etc.
- **`classNames`** — optional extra classes on `root`, `table`, `navButton`, `dayButton`

### Distribution and TypeScript

- **ESM**, **CommonJS**, **UMD** bundles plus **`pickupnewdate/style.css`**
- TypeScript sources with **strict** checking; types published as **`dist/index.d.ts`** after `npm run build`
- Responsive layout for viewports ≤ 640px

### Not included (see roadmap)

Event CRUD, recurrence, iCal sync, notifications, shared calendars, range/time pickers, RTL, and touch swipe are **not** implemented yet. Planned items are listed in [FEATURE_BACKLOG.md](FEATURE_BACKLOG.md).

## Installation

Published on [npm](https://www.npmjs.com/package/pickupnewdate) as `pickupnewdate`.

```bash
npm install pickupnewdate
```

## Usage

### CDN (unpkg / jsDelivr)

Pin a version in production (example: `2.1.0`):

```html
<div id="calendar"></div>
<link rel="stylesheet" href="https://unpkg.com/pickupnewdate@2.1.0/dist/pickupnewdate.css">
<script src="https://unpkg.com/pickupnewdate@2.1.0/dist/pickupnewdate.umd.js"></script>
<script>
    pickUpNewDate("eng", "calendar", {
        minDate: new Date(2026, 0, 1),
        maxDate: new Date(2026, 11, 31),
        disabledDaysOfWeek: [0, 6],
        onDateSelect: function (date) {
            console.log(date.getFullYear(), date.getMonth() + 1, date.getDate());
        }
    });
</script>
```

jsDelivr uses the same paths, for example `https://cdn.jsdelivr.net/npm/pickupnewdate@2.1.0/dist/pickupnewdate.umd.js`.

The UMD bundle exposes:

- `pickUpNewDate` on `window` (and `globalThis`) for script tags
- `PickUpNewDate.pickUpNewDate` as the named export on the UMD namespace

### Browser (local / bundled)

After installing from npm or building from source:

```bash
npm run build
```

```html
<div id="calendar"></div>
<link rel="stylesheet" href="node_modules/pickupnewdate/dist/pickupnewdate.css">
<script src="node_modules/pickupnewdate/dist/pickupnewdate.umd.js"></script>
<script>
    const calendar = pickUpNewDate("pl", "calendar", {
        initialDate: new Date(2026, 5, 15),
        onDateSelect: function (date) {
            console.log(date.getFullYear(), date.getMonth() + 1, date.getDate());
        },
        onMonthChange: function (year, month) {
            console.log("Month:", year, month);
        }
    });

    // later: calendar.goToDate(2026, 12, 1);
    // calendar.destroy();
</script>
```

Supported languages:

- `eng`
- `pl`
- `de`

### ES modules

```js
import "pickupnewdate/style.css";
import { pickUpNewDate } from "pickupnewdate";

pickUpNewDate("eng", "calendar", { theme: "auto" });
```

### CommonJS

```js
const { pickUpNewDate } = require("pickupnewdate");

pickUpNewDate("eng", "calendar");
```

### Next.js / Vue / React

**Built-in DOM calendar** — import CSS once, mount on the client:

```tsx
// app/layout.tsx or a client component
import "pickupnewdate/style.css";
import { pickUpNewDate } from "pickupnewdate";
import { useEffect, useRef } from "react";

export function CalendarWidget() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        const instance = pickUpNewDate("eng", ref.current, {
            theme: "auto",
            classNames: { root: "my-app-calendar" }
        });
        return () => instance.destroy();
    }, []);
    return <div ref={ref} />;
}
```

```css
/* globals.css — align with your design system (e.g. shadcn) */
.my-app-calendar {
    --pun-accent: hsl(var(--primary));
    --pun-radius: var(--radius);
}
```

**Headless** — use the framework-agnostic model generator and render your own UI:

```js
import { getCalendarViewModel, isDaySelectable } from "pickupnewdate";

const constraints = {
    minDate: new Date(2026, 0, 1),
    maxDate: new Date(2026, 11, 31),
    disabledDaysOfWeek: [0, 6]
};

const model = getCalendarViewModel(2026, 5, "eng", { firstDayOfWeek: 0 });
// model.weeks, model.dayNames, model.labels, model.monthName, ...

model.weeks.flat().forEach((day) => {
    if (day !== null && isDaySelectable(2026, 5, day, constraints)) {
        // render selectable day button
    }
});
```

In SSR/non-browser environments, initialize DOM rendering only on the client, or pass a custom document adapter via `options.document`.

### Theming and CSS tokens

The mount element receives `pun-root`. Tokens are scoped to that node (not global `:root`).

| Token | Purpose |
|-------|---------|
| `--pun-surface` | Calendar panel background |
| `--pun-text` / `--pun-text-muted` | Primary and secondary text |
| `--pun-accent` | Today ring, selected day, focus |
| `--pun-weekend-sat-bg` / `--pun-weekend-sun-bg` | Weekend column backgrounds |
| `--pun-weekday-bg` | Weekday header row |
| `--pun-radius` | Panel corner radius |

Override in your app:

```css
.pun-root {
    --pun-accent: #5856d6;
}
```

Force theme: `pickUpNewDate("eng", el, { theme: "dark" })` sets `data-pun-theme="dark"` on the mount node.

### Migrating from 1.x to 2.0

CSS class names are prefixed with `pun-`. Update custom selectors:

| 1.x | 2.0 |
|-----|-----|
| `table.calendar` | `table.pun-calendar` |
| `.calendarNavButton` | `.pun-navButton` |
| `.calendarDayButton` | `.pun-dayButton` |
| `.today` / `.selected` | `.pun-today` / `.pun-selected` |
| `.saturday` / `.sunday` | `.pun-saturday` / `.pun-sunday` |
| `.calendarLiveRegion` | `.pun-liveRegion` |

Import path `pickupnewdate/style.css` is unchanged.

## API Reference

### Factory and class

| Export | Description |
|--------|-------------|
| `pickUpNewDate(lang, area, options?)` | Creates a `Calendar` instance and renders into `area` (element id or `HTMLElement`) |
| `Calendar` | Class for direct instantiation with the same constructor signature |

### `Calendar` instance methods

| Method | Description |
|--------|-------------|
| `prevMonth()` | Go to previous month (no-op at year 1, month 1) |
| `nextMonth()` | Go to next month (no-op at year 9999, month 12) |
| `selectDate(day)` | Select a day in the current month (updates UI, calls `onDateSelect`) |
| `goToDate(year, month, day?)` | Navigate to month; if `day` is given, select it and call `onDateSelect` |
| `getSelectedDate()` | `Date` copy of selection, or `null` |
| `destroy()` | Tear down listeners and clear the mount node |
| `render()` | Re-render the month grid (usually called internally) |
| `canGoPrev()` / `canGoNext()` | Whether month navigation is allowed (year bounds and `minDate` / `maxDate`) |

### `Calendar` instance properties

| Property | Description |
|----------|-------------|
| `currentYear`, `currentMonth` | Visible month (month is 1–12) |
| `lang` | Resolved language code (`eng` \| `pl` \| `de`) |
| `options` | Constructor options |
| `labels`, `monthName` | Localized strings for the current view |

### Headless helpers

| Export | Description |
|--------|-------------|
| `getCalendarViewModel(year, month, lang?, options?)` | Frozen view model for custom rendering |
| `getMonthGrid(year, month, firstDayOfWeek?)` | Week grid of day numbers (`null` = empty cell); default Monday-first (`1`) |
| `isDaySelectable(year, month, day, constraints?)` | Whether a day is selectable under optional constraints |
| `compareDateOnly(a, b)` | Compare two dates by Y-M-D (`-1`, `0`, or `1`) |
| `dateKey(year, month, day)` / `dateKeyFromDate(date)` | Stable string keys for calendar days |
| `yearMonthValue(year, month)` | Numeric month index for range comparisons |
| `getDaysInMonth(year, month)` | Days in month (handles leap years) |
| `isLeapYear(year)` | Gregorian leap-year check |
| `canNavigateToMonth(year, month)` | `true` if year/month pass validation |
| `validateYear(year)` / `validateMonth(month)` | Throw `RangeError` if invalid |
| `validateFirstDayOfWeek(n)` | Throw `RangeError` if not 0–6 |
| `resolveLanguage(lang?)` | Supported language or `eng` fallback |
| `DAY_NAMES`, `MONTH_NAMES`, `LABELS` | Frozen i18n tables |
| `MIN_YEAR`, `MAX_YEAR` | `1` and `9999` |

### `CalendarOptions`

| Option | Type | Description |
|--------|------|-------------|
| `onDateSelect` | `(date: Date) => void` | Called when user selects a day |
| `onMonthChange` | `(year: number, month: number) => void` | Called after month changes |
| `initialDate` | `Date` | Initial visible month and selected day |
| `document` | `DocumentAdapter` | Custom `getElementById` / `createElement` for SSR or tests |
| `theme` | `"light"` \| `"dark"` \| `"auto"` | Color scheme (`"auto"` default; uses OS preference unless forced) |
| `classNames` | `Partial<Record<"root" \| "table" \| "navButton" \| "dayButton", string>>` | Extra CSS classes merged with library classes |
| `minDate` | `Date` | Earliest selectable day; also limits backward month navigation |
| `maxDate` | `Date` | Latest selectable day; also limits forward month navigation |
| `disabledDates` | `readonly Date[]` | Specific days excluded from selection |
| `disabledDaysOfWeek` | `readonly number[]` | Weekdays to disable (`0` = Sunday … `6` = Saturday) |
| `firstDayOfWeek` | `0`–`6` | First column of the grid (`1` = Monday default) |

Exported types: `CalendarTheme`, `CalendarClassNames`, `DateSelectionConstraints`, `FirstDayOfWeek`, `CalendarViewModelOptions`.

**Notes:** If `initialDate` or `goToDate(..., day)` targets a disabled day, the month still opens but no day is selected and `onDateSelect` is not called. Disabled day buttons use `.pun-disabled` and native `disabled`.

TypeScript types are published from `dist/index.d.ts` after `npm run build`.

## Security and data integrity

- Input validation rejects invalid `year` and `month` values with explicit errors.
- Internal language dictionaries (`DAY_NAMES`, `MONTH_NAMES`, `LABELS`) are deep-frozen to prevent runtime mutation.
- Rendering uses safe DOM APIs (`textContent`, `setAttribute`) and does not use `innerHTML`.

## Development

Source code lives in `src/` as TypeScript. Build and type-check:

```bash
npm run build
npm run typecheck
```

Run tests (TypeScript via `tsx`):

```bash
npm test
```

Full verification (build, types, tests):

```bash
npm run test:build
```

See [FEATURE_BACKLOG.md](FEATURE_BACKLOG.md) for planned enhancements.

## Publishing

Releases are published to npm when a semver tag (`v*`) is pushed on **`master`** (GitHub Actions). See [PUBLISHING.md](PUBLISHING.md) for trusted publisher setup and the release checklist.
