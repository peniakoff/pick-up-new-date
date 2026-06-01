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

export interface CalendarOptions {
    onDateSelect?: (date: Date) => void;
    onMonthChange?: (year: number, month: number) => void;
    initialDate?: Date;
    document?: DocumentAdapter;
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
