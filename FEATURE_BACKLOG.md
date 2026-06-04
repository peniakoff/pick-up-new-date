# Feature backlog — PickUpNewDate

Roadmap after the TypeScript migration and API improvements (development plan).  
Status legend: **done** = available in the current library release (**v2.1.0+** for date constraints and week start; **v2.0.0+** for styling/theming; see [CHANGELOG.md](CHANGELOG.md) for breaking CSS class renames).

## Implemented (current)

Features available in source and in the published `pickupnewdate` package:

| Area | Feature | Notes |
|------|---------|--------|
| View | Month grid (Monday-first week) | `getMonthGrid`, `Calendar.render` |
| View | Previous / next month navigation | `prevMonth`, `nextMonth`, ‹ › buttons |
| View | Year range **1–9999** on navigation | `canGoPrev`, `canGoNext`, disabled buttons at bounds |
| View | **Today** highlight | `.pun-today` class, `aria-current="date"` |
| View | Weekend styling | `.pun-saturday`, `.pun-sunday` classes |
| Selection | `onDateSelect` callback | local `Date` object |
| Selection | **`initialDate`** — starting month and selected day | constructor option |
| Selection | **Selected date** state in UI | `selectedDate`, `.pun-selected`, `aria-selected` |
| Selection | `getSelectedDate()` | returns a copy of the selected date |
| Instance API | `goToDate(year, month, day?)` | navigate + optional day selection |
| Instance API | `destroy()` | removes listeners and clears mount node |
| Instance API | `onMonthChange(year, month)` | after month changes |
| Instance API | Multiple instances per page | each `pickUpNewDate()` call is a separate instance |
| i18n | **eng**, **pl**, **de** | `DAY_NAMES`, `MONTH_NAMES`, `LABELS` |
| i18n | English fallback + console warning | `resolveLanguage` |
| Headless | `getCalendarViewModel` | React / Vue / Next without library DOM |
| Headless | Date helpers: `isLeapYear`, `getDaysInMonth`, `getMonthGrid` | year/month validation |
| Integration | `options.document` adapter | SSR, non-browser tests |
| Distribution | ESM, CJS, UMD + CSS | Rollup, `pickupnewdate/style.css` |
| Distribution | TypeScript sources `.ts`, declarations in `dist/*.d.ts` | strict mode |
| Accessibility | `role="grid"`, ARIA labels on nav and days | |
| Accessibility | **`aria-live`** on month change | `.pun-liveRegion` |
| Accessibility | Keyboard: ←/→ change month (including when a day is focused) | capture on root |
| Accessibility | Keyboard: arrow keys between days in the grid | when a day button is focused |
| Accessibility | `:focus-visible` on buttons | `.pun-navButton`, `.pun-dayButton` in `style.css` |
| Accessibility | `prefers-reduced-motion` | disables transition animations |
| Security | `textContent` / `setAttribute`, no `innerHTML` | |
| Security | Frozen dictionaries (`deepFreeze`) | |
| Styling | Responsive layout (`max-width: 640px`) | |
| Styling | macOS-inspired design tokens + `pun-` namespace | `.pun-root`, CSS variables |
| Styling | Light / dark / auto theme | `options.theme`, `data-pun-theme`, `prefers-color-scheme` |
| Styling | `classNames` hook for frameworks | `CalendarOptions.classNames` |
| Styling | Component-scoped styles (no global `body` rules) | tokens on `.pun-root` |
| Styling | Empty grid cells | `.pun-emptyDay` (non-interactive padding cells) |
| Styling | `color-scheme` on mount | `light dark` on `.pun-root` for native form controls |
| API | Theme + class hook types | exported `CalendarTheme`, `CalendarClassNames` |
| Selection | **`minDate` / `maxDate`** | limits selection and month navigation |
| Selection | **`disabledDates`** | specific days excluded |
| Selection | **`disabledDaysOfWeek`** | weekday exclusion (`0`–`6`, JS `getDay()`) |
| Selection | **`firstDayOfWeek`** | configurable grid start (`1` = Monday default) |
| Selection | Disabled day styling | `.pun-disabled`, `button:disabled`, `--pun-day-disabled-opacity` |
| Headless | **`isDaySelectable`**, **`compareDateOnly`** | constraint checks for custom UI |
| Headless | `getMonthGrid` / `getCalendarViewModel` + week start | optional `firstDayOfWeek` |

Full API description and examples: [README.md](README.md). Migration **1.x → 2.0**: README *Migrating* section.

---

## Track A — Date picker (planned extensions)

| Priority | Feature | Status | Effort |
|----------|---------|--------|--------|
| P2 | Range picker | planned | Medium |
| P2 | Time picker | planned | Medium |
| P2 | Locale via `Intl` | planned | Medium |
| P2 | RTL (`dir="rtl"`) | planned | Medium |
| P2 | Touch swipe | planned | Medium |
| P2 | Storybook / playground | planned (demo: [`index.html`](index.html); no Storybook yet) | Medium |
| P2 | Minified CSS export (`style.min.css`) | planned | Low |
| P2 | Optional Tailwind preset package | planned | Medium |

---

## Track B — Full event calendar (separate product)

Requires a domain layer and usually a backend (API + persistence). **Nothing in this track is implemented yet.**

| Priority | Feature | Status | Effort |
|----------|---------|--------|--------|
| P3 | Event model | planned | High |
| P3 | Events in month grid | planned | High |
| P3 | Week / day / agenda views | planned | High |
| P3 | Recurrence (RRULE) | planned | High |
| P3 | iCal import / export | planned | High |
| P3 | Notifications | planned | High |
| P3 | Shared calendars | planned | High |
| P3 | Offline / online sync | planned | High |
| P3 | Google / Outlook / CalDAV integrations | planned | High |

---

## Recommendation

1. Complete **Track A (P2)** within the `pickupnewdate` npm library (range picker, time picker, Intl, RTL, touch, Storybook, minified CSS).
2. Plan **Track B** as a separate package or host application, using `getCalendarViewModel()` for the month presentation layer.
