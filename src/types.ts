export type Language = "eng" | "pl" | "de";

export interface LocalizedStrings {
    eng: readonly string[];
    pl: readonly string[];
    de: readonly string[];
}

export interface LabelSet {
    previousMonth: string;
    nextMonth: string;
    calendar: string;
    chooseDate: string;
}

export interface Labels {
    eng: LabelSet;
    pl: LabelSet;
    de: LabelSet;
}

export interface DocumentAdapter {
    getElementById(id: string): CalendarRoot | null;
    createElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K
    ): HTMLElementTagNameMap[K];
    createElement(tagName: string): HTMLElement;
}

export type CalendarRoot = HTMLElement & {
    replaceChildren(...nodes: (Node | string)[]): void;
};

export type CalendarTheme = "light" | "dark" | "auto";

export type CalendarClassNames = Partial<
    Record<"root" | "table" | "navButton" | "dayButton", string>
>;

export type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DateSelectionConstraints {
    minDate?: Date;
    maxDate?: Date;
    /** Specific calendar days excluded from selection */
    disabledDates?: readonly Date[];
    /** 0 = Sunday … 6 = Saturday (JavaScript Date.getDay() convention) */
    disabledDaysOfWeek?: readonly FirstDayOfWeek[];
}

export interface CalendarViewModelOptions {
    firstDayOfWeek?: FirstDayOfWeek;
}

export interface CalendarOptions extends DateSelectionConstraints {
    onDateSelect?: (date: Date) => void;
    onMonthChange?: (year: number, month: number) => void;
    initialDate?: Date;
    document?: DocumentAdapter;
    /** @default "auto" — follows OS; use "light" or "dark" to force via data-pun-theme */
    theme?: CalendarTheme;
    classNames?: CalendarClassNames;
    /** @default 1 — Monday; use 0 for Sunday (US) */
    firstDayOfWeek?: FirstDayOfWeek;
}

export interface CalendarViewModel {
    year: number;
    month: number;
    language: Language;
    monthName: string;
    dayNames: readonly string[];
    labels: LabelSet;
    weeks: ReadonlyArray<ReadonlyArray<number | null>>;
}

export const MIN_YEAR = 1;
export const MAX_YEAR = 9999;
