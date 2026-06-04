# Changelog

## 2.1.0

### Added

- `options.minDate` and `options.maxDate` — constrain selectable days and month navigation.
- `options.disabledDates` — block specific calendar days.
- `options.disabledDaysOfWeek` — block weekdays using JavaScript convention (`0` = Sunday … `6` = Saturday).
- `options.firstDayOfWeek` — configurable week start (`1` = Monday default; `0` = Sunday).
- Headless helpers: `isDaySelectable`, `compareDateOnly`, `dateKey`, `dateKeyFromDate`, `yearMonthValue`, `validateFirstDayOfWeek`.
- `getMonthGrid(year, month, firstDayOfWeek?)` and `getCalendarViewModel(..., options?)` support custom week start.
- CSS token `--pun-day-disabled-opacity` and styles for disabled day buttons (`.pun-disabled`).

### Changed

- Weekend cell classes (`.pun-saturday`, `.pun-sunday`) are applied from the actual weekday, not grid column index.
- Keyboard arrow navigation skips disabled days within the current month.
- `options.minDate`, `options.maxDate`, `options.disabledDates`, and `options.initialDate` must be valid `Date` values (finite timestamp).
- `options.disabledDaysOfWeek` is typed as `readonly FirstDayOfWeek[]` (0–6).
- Removed unused `constraints` field from `CalendarViewModelOptions` (use `isDaySelectable()` for headless UI).

## 2.0.0

### Breaking

- CSS classes renamed with `pun-` prefix (see README migration table).
- Weekend / day cell classes: `currentMonth` → `pun-dayCell`, `saturday` → `pun-saturday`, `sunday` → `pun-sunday`.
- State classes: `today` → `pun-today`, `selected` → `pun-selected`.

### Added

- macOS-inspired default theme with CSS custom properties on `.pun-root`.
- Light, dark, and auto (`prefers-color-scheme`) themes via `options.theme` and `data-pun-theme`.
- `options.classNames` for extra classes on root, table, nav, and day buttons.
- Exported types `CalendarTheme`, `CalendarClassNames`.

### Changed

- Visual design: softer shadows, system blue accent, ghost navigation buttons.
- Mount element receives `pun-root` automatically.

## 1.1.1 and earlier

See git history for prior releases.
