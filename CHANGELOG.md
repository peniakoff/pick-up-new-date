# Changelog

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
