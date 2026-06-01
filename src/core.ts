import type { CalendarViewModel, LabelSet, Labels, Language, LocalizedStrings } from "./types.js";
import { MAX_YEAR, MIN_YEAR } from "./types.js";

function deepFreeze<T>(value: T): T {
    if (value && typeof value === "object") {
        Object.freeze(value);
        Object.keys(value as object).forEach((key) => {
            deepFreeze((value as Record<string, unknown>)[key]);
        });
    }

    return value;
}

export const DAY_NAMES = deepFreeze({
    eng: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    pl: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
    de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
} satisfies LocalizedStrings);

export const MONTH_NAMES = deepFreeze({
    eng: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],
    pl: [
        "Styczeń",
        "Luty",
        "Marzec",
        "Kwiecień",
        "Maj",
        "Czerwiec",
        "Lipiec",
        "Sierpień",
        "Wrzesień",
        "Październik",
        "Listopad",
        "Grudzień"
    ],
    de: [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
    ]
} satisfies LocalizedStrings);

export const LABELS = deepFreeze({
    eng: {
        previousMonth: "previous month",
        nextMonth: "next month",
        calendar: "Calendar",
        chooseDate: "Choose date"
    },
    pl: {
        previousMonth: "poprzedni miesiąc",
        nextMonth: "następny miesiąc",
        calendar: "Kalendarz",
        chooseDate: "Wybierz datę"
    },
    de: {
        previousMonth: "Vormonat",
        nextMonth: "nächster Monat",
        calendar: "Kalender",
        chooseDate: "Datum auswählen"
    }
} satisfies Labels);

const MONTH_DAYS = deepFreeze([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const);

export function validateYear(year: number): void {
    if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
        throw new RangeError("PickUpNewDate: year must be an integer between 1 and 9999.");
    }
}

export function validateMonth(month: number): void {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw new RangeError("PickUpNewDate: month must be an integer between 1 and 12.");
    }
}

export function isLeapYear(year: number): boolean {
    validateYear(year);
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(year: number, month: number): number {
    validateYear(year);
    validateMonth(month);

    if (month === 2 && isLeapYear(year)) {
        return 29;
    }

    return MONTH_DAYS[month - 1] ?? 31;
}

export function createLocalDate(year: number, month: number, day: number): Date {
    const date = new Date();
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
}

export function resolveLanguage(lang?: string): Language {
    if (!lang || !Object.prototype.hasOwnProperty.call(DAY_NAMES, lang)) {
        if (lang) {
            console.warn(`PickUpNewDate: unsupported language "${lang}", falling back to "eng".`);
        }
        return "eng";
    }

    return lang as Language;
}

function toMondayFirst(day: number): number {
    return day === 0 ? 7 : day;
}

export function getMonthGrid(year: number, month: number): Array<Array<number | null>> {
    validateYear(year);
    validateMonth(month);

    const firstWeekday = toMondayFirst(createLocalDate(year, month, 1).getDay());
    const totalDays = getDaysInMonth(year, month);
    const weeks: Array<Array<number | null>> = [];
    let currentWeek: Array<number | null> = new Array(7).fill(null);

    for (let day = 1; day <= totalDays; day += 1) {
        const index = day === 1 ? firstWeekday - 1 : (firstWeekday + day - 2) % 7;
        currentWeek[index] = day;

        if (index === 6 || day === totalDays) {
            weeks.push(currentWeek);
            currentWeek = new Array(7).fill(null);
        }
    }

    return weeks;
}

export function canNavigateToMonth(year: number, month: number): boolean {
    try {
        validateYear(year);
        validateMonth(month);
        return true;
    } catch {
        return false;
    }
}

export function getCalendarViewModel(year: number, month: number, lang?: string): CalendarViewModel {
    const language = resolveLanguage(lang);
    const weeks = getMonthGrid(year, month);
    weeks.forEach((week) => Object.freeze(week));

    return Object.freeze({
        year,
        month,
        language,
        monthName: MONTH_NAMES[language][month - 1] ?? "",
        dayNames: DAY_NAMES[language],
        labels: LABELS[language],
        weeks: Object.freeze(weeks)
    });
}

export type { CalendarViewModel, LabelSet, Labels, Language, LocalizedStrings };
