import { createLocalDate, getCalendarViewModel, getDaysInMonth, resolveLanguage, validateMonth, validateYear } from "./core.js";
import type { CalendarOptions, CalendarRoot, CalendarTheme, DocumentAdapter } from "./types.js";
import { MAX_YEAR, MIN_YEAR } from "./types.js";

function isCalendarRoot(value: unknown): value is CalendarRoot {
    return (
        value !== null &&
        typeof value === "object" &&
        typeof (value as CalendarRoot).replaceChildren === "function"
    );
}

export class Calendar {
    readonly lang;
    readonly options: CalendarOptions;
    currentMonth: number;
    currentYear: number;
    selectedDate: Date | null = null;

    private readonly documentRef: DocumentAdapter;
    private readonly root: CalendarRoot;
    private readonly handleRootKeydown: (event: KeyboardEvent) => void;
    private liveRegion: HTMLDivElement | null = null;
    private renderedAt = new Date();
    private destroyed = false;

    constructor(lang: string | undefined, area: string | CalendarRoot, options?: CalendarOptions) {
        this.lang = resolveLanguage(lang);
        this.options = options ?? {};
        this.documentRef = this.resolveDocument(this.options.document);

        if (typeof this.options.onDateSelect !== "undefined" && typeof this.options.onDateSelect !== "function") {
            throw new Error("PickUpNewDate: options.onDateSelect must be a function.");
        }

        if (typeof this.options.onMonthChange !== "undefined" && typeof this.options.onMonthChange !== "function") {
            throw new Error("PickUpNewDate: options.onMonthChange must be a function.");
        }

        if (
            typeof this.options.theme !== "undefined" &&
            !["light", "dark", "auto"].includes(this.options.theme)
        ) {
            throw new Error('PickUpNewDate: options.theme must be "light", "dark", or "auto".');
        }

        this.root = this.resolveRoot(area);
        this.applyRootStyling();

        const today = new Date();
        this.currentMonth = today.getMonth() + 1;
        this.currentYear = today.getFullYear();

        if (this.options.initialDate) {
            const initial = this.options.initialDate;
            validateYear(initial.getFullYear());
            validateMonth(initial.getMonth() + 1);
            this.currentYear = initial.getFullYear();
            this.currentMonth = initial.getMonth() + 1;
            this.selectedDate = createLocalDate(initial.getFullYear(), initial.getMonth() + 1, initial.getDate());
        }

        this.handleRootKeydown = (event: KeyboardEvent) => {
            this.onRootKeydown(event);
        };

        this.root.addEventListener("keydown", this.handleRootKeydown, true);
        this.ensureLiveRegion();
        this.render();
    }

    get monthName(): string {
        return getCalendarViewModel(this.currentYear, this.currentMonth, this.lang).monthName;
    }

    get labels() {
        return getCalendarViewModel(this.currentYear, this.currentMonth, this.lang).labels;
    }

    getSelectedDate(): Date | null {
        return this.selectedDate ? new Date(this.selectedDate) : null;
    }

    canGoPrev(): boolean {
        if (this.currentMonth > 1) {
            return true;
        }
        return this.currentYear > MIN_YEAR;
    }

    canGoNext(): boolean {
        if (this.currentMonth < 12) {
            return true;
        }
        return this.currentYear < MAX_YEAR;
    }

    goToDate(year: number, month: number, day?: number): void {
        this.assertNotDestroyed();
        validateYear(year);
        validateMonth(month);

        this.currentYear = year;
        this.currentMonth = month;

        if (day !== undefined) {
            const maxDay = getDaysInMonth(year, month);
            if (!Number.isInteger(day) || day < 1 || day > maxDay) {
                throw new RangeError(
                    `PickUpNewDate: day must be an integer between 1 and ${maxDay} for ${year}-${month}.`
                );
            }
            this.selectedDate = createLocalDate(year, month, day);
            this.options.onDateSelect?.(new Date(this.selectedDate));
        }

        this.render();
        this.notifyMonthChange();
    }

    destroy(): void {
        if (this.destroyed) {
            return;
        }
        this.root.removeEventListener("keydown", this.handleRootKeydown, true);
        this.root.replaceChildren();
        this.liveRegion = null;
        this.destroyed = true;
    }

    prevMonth(): void {
        this.assertNotDestroyed();
        if (!this.canGoPrev()) {
            return;
        }

        if (this.currentMonth === 1) {
            this.currentMonth = 12;
            this.currentYear -= 1;
        } else {
            this.currentMonth -= 1;
        }

        this.render();
        this.notifyMonthChange();
    }

    nextMonth(): void {
        this.assertNotDestroyed();
        if (!this.canGoNext()) {
            return;
        }

        if (this.currentMonth === 12) {
            this.currentMonth = 1;
            this.currentYear += 1;
        } else {
            this.currentMonth += 1;
        }

        this.render();
        this.notifyMonthChange();
    }

    selectDate(day: number): void {
        this.assertNotDestroyed();
        this.selectedDate = createLocalDate(this.currentYear, this.currentMonth, day);
        this.options.onDateSelect?.(new Date(this.selectedDate));
        this.render();
    }

    render(): void {
        this.assertNotDestroyed();
        this.renderedAt = new Date();
        const viewModel = getCalendarViewModel(this.currentYear, this.currentMonth, this.lang);
        const { labels, dayNames, weeks } = viewModel;
        const monthYearLabel = `${viewModel.monthName}, ${viewModel.year}`;

        const table = this.documentRef.createElement("table");
        const thead = this.documentRef.createElement("thead");
        const tbody = this.documentRef.createElement("tbody");
        const navRow = this.documentRef.createElement("tr");
        const daysRow = this.documentRef.createElement("tr");

        table.className = this.mergeClassName("pun-calendar", this.options.classNames?.table);
        table.setAttribute("role", "grid");
        table.setAttribute("aria-label", `${labels.calendar}: ${viewModel.monthName} ${viewModel.year}`);

        const caption = this.documentRef.createElement("caption");
        caption.className = "pun-caption";
        caption.textContent = monthYearLabel;
        table.appendChild(caption);

        const prevCell = this.documentRef.createElement("td");
        prevCell.className = "pun-monthHeader";
        prevCell.appendChild(
            this.createNavigationButton("‹", labels.previousMonth, () => this.prevMonth(), !this.canGoPrev())
        );

        const titleCell = this.documentRef.createElement("td");
        titleCell.className = "pun-monthHeader";
        titleCell.colSpan = 5;
        titleCell.textContent = monthYearLabel;

        const nextCell = this.documentRef.createElement("td");
        nextCell.className = "pun-monthHeader";
        nextCell.appendChild(
            this.createNavigationButton("›", labels.nextMonth, () => this.nextMonth(), !this.canGoNext())
        );

        navRow.appendChild(prevCell);
        navRow.appendChild(titleCell);
        navRow.appendChild(nextCell);
        thead.appendChild(navRow);

        dayNames.forEach((dayName) => {
            const headerCell = this.documentRef.createElement("th");
            headerCell.className = "pun-weekDayName";
            headerCell.scope = "col";
            headerCell.textContent = dayName;
            daysRow.appendChild(headerCell);
        });
        thead.appendChild(daysRow);

        weeks.forEach((week) => {
            const row = this.documentRef.createElement("tr");

            week.forEach((day, index) => {
                const cell = this.documentRef.createElement("td");
                cell.setAttribute("role", "gridcell");

                if (day !== null) {
                    cell.classList.add("pun-dayCell");
                    if (index === 5) {
                        cell.classList.add("pun-saturday");
                    }
                    if (index === 6) {
                        cell.classList.add("pun-sunday");
                    }
                    cell.appendChild(this.createDayButton(day));
                } else {
                    cell.classList.add("pun-emptyDay");
                    cell.setAttribute("aria-hidden", "true");
                }

                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);

        this.ensureLiveRegion();
        if (this.liveRegion) {
            this.liveRegion.textContent = monthYearLabel;
        }

        this.root.replaceChildren();
        if (this.liveRegion) {
            this.root.appendChild(this.liveRegion);
        }
        this.root.appendChild(table);
    }

    private resolveDocument(customDocument?: DocumentAdapter): DocumentAdapter {
        if (customDocument) {
            if (
                typeof customDocument.getElementById !== "function" ||
                typeof customDocument.createElement !== "function"
            ) {
                throw new Error("PickUpNewDate: options.document must implement getElementById and createElement.");
            }
            return customDocument;
        }

        if (typeof document !== "undefined") {
            return document;
        }

        throw new Error(
            "PickUpNewDate: document is unavailable. Initialize on the client or provide options.document."
        );
    }

    private resolveRoot(area: string | CalendarRoot): CalendarRoot {
        if (typeof area === "string") {
            const element = this.documentRef.getElementById(area);
            if (!element) {
                throw new Error(`PickUpNewDate: target area "${area}" was not found.`);
            }
            return element;
        }

        if (!isCalendarRoot(area)) {
            throw new Error("PickUpNewDate: target area must be a DOM element or element id.");
        }

        return area;
    }

    private assertNotDestroyed(): void {
        if (this.destroyed) {
            throw new Error("PickUpNewDate: this calendar instance has been destroyed.");
        }
    }

    private notifyMonthChange(): void {
        this.options.onMonthChange?.(this.currentYear, this.currentMonth);
    }

    private ensureLiveRegion(): void {
        if (!this.liveRegion) {
            this.liveRegion = this.documentRef.createElement("div");
            this.liveRegion.className = "pun-liveRegion";
            this.liveRegion.setAttribute("aria-live", "polite");
            this.liveRegion.setAttribute("aria-atomic", "true");
        }
    }

    private onRootKeydown(event: KeyboardEvent): void {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        if (target.classList.contains("pun-dayButton")) {
            const day = Number(target.dataset.day);
            if (Number.isInteger(day) && this.handleDayKey(event.key, day)) {
                event.preventDefault();
                return;
            }
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            this.prevMonth();
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            this.nextMonth();
        }
    }

    private handleDayKey(key: string, currentDay: number): boolean {
        const weeks = getCalendarViewModel(this.currentYear, this.currentMonth, this.lang).weeks;
        let row = -1;
        let col = -1;

        weeks.forEach((week, rowIndex) => {
            week.forEach((day, colIndex) => {
                if (day === currentDay) {
                    row = rowIndex;
                    col = colIndex;
                }
            });
        });

        if (row < 0 || col < 0) {
            return false;
        }

        let dRow = 0;
        let dCol = 0;

        switch (key) {
            case "ArrowLeft":
                dCol = -1;
                break;
            case "ArrowRight":
                dCol = 1;
                break;
            case "ArrowUp":
                dRow = -1;
                break;
            case "ArrowDown":
                dRow = 1;
                break;
            default:
                return false;
        }
        let nextRow = row;
        let nextCol = col;
        const maxSteps = weeks.length * 7;
        for (let step = 0; step < maxSteps; step += 1) {
            nextRow += dRow;
            nextCol += dCol;
            if (nextCol < 0 || nextCol > 6 || nextRow < 0 || nextRow >= weeks.length) {
                return false;
            }
            const nextDay = weeks[nextRow]?.[nextCol];
            if (nextDay !== null && nextDay !== undefined) {
                const button = this.root.querySelector<HTMLButtonElement>(
                    `button.pun-dayButton[data-day="${nextDay}"]`
                );
                button?.focus();
                return true;
            }
        }
        return false;
    }

    private createNavigationButton(
        icon: string,
        label: string,
        action: () => void,
        disabled: boolean
    ): HTMLButtonElement {
        const button = this.documentRef.createElement("button");
        button.type = "button";
        button.className = this.mergeClassName("pun-navButton", this.options.classNames?.navButton);
        button.setAttribute("aria-label", label);
        button.disabled = disabled;
        if (disabled) {
            button.setAttribute("aria-disabled", "true");
        }
        button.addEventListener("click", action);

        const iconNode = this.documentRef.createElement("span");
        iconNode.className = "pun-navIcon";
        iconNode.setAttribute("aria-hidden", "true");
        iconNode.textContent = icon;
        button.appendChild(iconNode);

        return button;
    }

    private createDayButton(day: number): HTMLButtonElement {
        const button = this.documentRef.createElement("button");
        button.type = "button";
        button.className = this.mergeClassName("pun-dayButton", this.options.classNames?.dayButton);
        button.textContent = String(day);
        button.dataset.day = String(day);
        button.setAttribute(
            "aria-label",
            `${this.labels.chooseDate}: ${day} ${this.monthName} ${this.currentYear}`
        );

        const today = this.renderedAt;
        const isToday =
            day === today.getDate() &&
            this.currentMonth === today.getMonth() + 1 &&
            this.currentYear === today.getFullYear();

        if (isToday) {
            button.classList.add("pun-today");
            button.setAttribute("aria-current", "date");
        }

        if (this.isSelectedDay(day)) {
            button.classList.add("pun-selected");
            button.setAttribute("aria-selected", "true");
        } else {
            button.setAttribute("aria-selected", "false");
        }

        button.addEventListener("click", () => {
            this.selectDate(day);
        });

        return button;
    }

    private isSelectedDay(day: number): boolean {
        if (!this.selectedDate) {
            return false;
        }
        return (
            this.selectedDate.getFullYear() === this.currentYear &&
            this.selectedDate.getMonth() + 1 === this.currentMonth &&
            this.selectedDate.getDate() === day
        );
    }

    private applyRootStyling(): void {
        this.root.classList.add("pun-root");
        const extraRoot = this.options.classNames?.root;
        if (extraRoot) {
            extraRoot
                .split(/\s+/)
                .filter(Boolean)
                .forEach((token) => this.root.classList.add(token));
        }

        const theme: CalendarTheme = this.options.theme ?? "auto";
        if (theme === "auto") {
            this.root.removeAttribute("data-pun-theme");
        } else {
            this.root.setAttribute("data-pun-theme", theme);
        }
    }

    private mergeClassName(base: string, extra?: string): string {
        if (!extra) {
            return base;
        }
        return `${base} ${extra}`.trim();
    }
}

export function pickUpNewDate(
    lang: string | undefined,
    area: string | CalendarRoot,
    options?: CalendarOptions
): Calendar {
    return new Calendar(lang, area, options);
}

export default pickUpNewDate;
