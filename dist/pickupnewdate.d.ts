export type Language = "eng" | "pl" | "de";

export interface LocalizedStrings {
    eng: string[];
    pl: string[];
    de: string[];
}

export interface Labels {
    eng: {
        previousMonth: string;
        nextMonth: string;
        calendar: string;
        chooseDate: string;
    };
    pl: {
        previousMonth: string;
        nextMonth: string;
        calendar: string;
        chooseDate: string;
    };
    de: {
        previousMonth: string;
        nextMonth: string;
        calendar: string;
        chooseDate: string;
    };
}

export interface CalendarOptions {
    onDateSelect?: (date: Date) => void;
}

export declare const DAY_NAMES: LocalizedStrings;
export declare const MONTH_NAMES: LocalizedStrings;
export declare const LABELS: Labels;

export declare function isLeapYear(year: number): boolean;
export declare function getDaysInMonth(year: number, month: number): number;
export declare function getMonthGrid(year: number, month: number): Array<Array<number | null>>;
export declare function resolveLanguage(lang?: string): Language;

export declare class Calendar {
    constructor(lang: string | undefined, area: string | HTMLElement, options?: CalendarOptions);
    currentMonth: number;
    currentYear: number;
    lang: Language;
    options: CalendarOptions;
    readonly labels: Labels[Language];
    readonly monthName: string;
    nextMonth(): void;
    prevMonth(): void;
    render(): void;
    selectDate(day: number): void;
}

export declare function pickUpNewDate(
    lang: string | undefined,
    area: string | HTMLElement,
    options?: CalendarOptions
): Calendar;

export default pickUpNewDate;
