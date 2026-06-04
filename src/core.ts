import type {
    CalendarViewModel,
    CalendarViewModelOptions,
    DateSelectionConstraints,
    FirstDayOfWeek,
    LabelSet,
    Labels,
    Language,
    LocalizedStrings
} from "./types.js";
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

const DEFAULT_FIRST_DAY_OF_WEEK: FirstDayOfWeek = 1;

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

export function validateFirstDayOfWeek(firstDayOfWeek: number): void {
    if (!Number.isInteger(firstDayOfWeek) || firstDayOfWeek < 0 || firstDayOfWeek > 6) {
        throw new RangeError("PickUpNewDate: firstDayOfWeek must be an integer between 0 and 6.");
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

export function compareDateOnly(a: Date, b: Date): -1 | 0 | 1 {
    const yearDiff = a.getFullYear() - b.getFullYear();
    if (yearDiff !== 0) {
        return yearDiff < 0 ? -1 : 1;
    }

    const monthDiff = a.getMonth() - b.getMonth();
    if (monthDiff !== 0) {
        return monthDiff < 0 ? -1 : 1;
    }

    const dayDiff = a.getDate() - b.getDate();
    if (dayDiff !== 0) {
        return dayDiff < 0 ? -1 : 1;
    }

    return 0;
}

export function dateKey(year: number, month: number, day: number): string {
    return `${year}-${month}-${day}`;
}

export function dateKeyFromDate(date: Date): string {
    return dateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function yearMonthValue(year: number, month: number): number {
    validateYear(year);
    validateMonth(month);
    return year * 12 + (month - 1);
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

function weekdayColumn(dayOfWeek: number, firstDayOfWeek: number): number {
    return (dayOfWeek - firstDayOfWeek + 7) % 7;
}

function rotateDayNames(names: readonly string[], firstDayOfWeek: number): readonly string[] {
    const monFirstIndex = (firstDayOfWeek + 6) % 7;
    const rotated = [...names];
    for (let i = 0; i < monFirstIndex; i += 1) {
        const first = rotated.shift();
        if (first !== undefined) {
            rotated.push(first);
        }
    }
    return rotated;
}

export function isDaySelectable(
    year: number,
    month: number,
    day: number,
    constraints?: DateSelectionConstraints
): boolean {
    validateYear(year);
    validateMonth(month);

    const maxDay = getDaysInMonth(year, month);
    if (!Number.isInteger(day) || day < 1 || day > maxDay) {
        return false;
    }

    if (!constraints) {
        return true;
    }

    const date = createLocalDate(year, month, day);

    if (constraints.minDate && compareDateOnly(date, constraints.minDate) < 0) {
        return false;
    }

    if (constraints.maxDate && compareDateOnly(date, constraints.maxDate) > 0) {
        return false;
    }

    if (constraints.disabledDaysOfWeek?.includes(date.getDay())) {
        return false;
    }

    if (constraints.disabledDates) {
        const key = dateKey(year, month, day);
        for (const disabledDate of constraints.disabledDates) {
            if (dateKeyFromDate(disabledDate) === key) {
                return false;
            }
        }
    }

    return true;
}

export function getMonthGrid(
    year: number,
    month: number,
    firstDayOfWeek: number = DEFAULT_FIRST_DAY_OF_WEEK
): Array<Array<number | null>> {
    validateYear(year);
    validateMonth(month);
    validateFirstDayOfWeek(firstDayOfWeek);

    const firstWeekday = weekdayColumn(createLocalDate(year, month, 1).getDay(), firstDayOfWeek);
    const totalDays = getDaysInMonth(year, month);
    const weeks: Array<Array<number | null>> = [];
    let currentWeek: Array<number | null> = new Array(7).fill(null);

    for (let day = 1; day <= totalDays; day += 1) {
        const index = (firstWeekday + day - 1) % 7;
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

export function getCalendarViewModel(
    year: number,
    month: number,
    lang?: string,
    options?: CalendarViewModelOptions
): CalendarViewModel {
    const language = resolveLanguage(lang);
    const firstDayOfWeek = options?.firstDayOfWeek ?? DEFAULT_FIRST_DAY_OF_WEEK;
    validateFirstDayOfWeek(firstDayOfWeek);

    const weeks = getMonthGrid(year, month, firstDayOfWeek);
    weeks.forEach((week) => Object.freeze(week));

    return Object.freeze({
        year,
        month,
        language,
        monthName: MONTH_NAMES[language][month - 1] ?? "",
        dayNames: Object.freeze(rotateDayNames(DAY_NAMES[language], firstDayOfWeek)),
        labels: LABELS[language],
        weeks: Object.freeze(weeks)
    });
}

export type {
    CalendarViewModel,
    CalendarViewModelOptions,
    DateSelectionConstraints,
    FirstDayOfWeek,
    LabelSet,
    Labels,
    Language,
    LocalizedStrings
};
