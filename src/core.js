function deepFreeze(value) {
    if (value && typeof value === "object") {
        Object.freeze(value);
        Object.keys(value).forEach((key) => {
            deepFreeze(value[key]);
        });
    }

    return value;
}

export const DAY_NAMES = deepFreeze({
    eng: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    pl: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
    de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
});

export const MONTH_NAMES = deepFreeze({
    eng: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    pl: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
    de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
});

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
        nextMonth: "nächsten Monat",
        calendar: "Kalender",
        chooseDate: "Datum auswählen"
    }
});

const MONTH_DAYS = deepFreeze([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);

function validateYear(year) {
    if (!Number.isInteger(year) || year < 1 || year > 9999) {
        throw new RangeError("PickUpNewDate: year must be an integer between 1 and 9999.");
    }
}

function validateMonth(month) {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw new RangeError("PickUpNewDate: month must be an integer between 1 and 12.");
    }
}

export function isLeapYear(year) {
    validateYear(year);
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(year, month) {
    validateYear(year);
    validateMonth(month);

    if (month === 2 && isLeapYear(year)) {
        return 29;
    }

    return MONTH_DAYS[month - 1];
}

export function resolveLanguage(lang) {
    if (!lang || !DAY_NAMES[lang]) {
        return "eng";
    }

    return lang;
}

function toMondayFirst(day) {
    return day === 0 ? 7 : day;
}

export function getMonthGrid(year, month) {
    validateYear(year);
    validateMonth(month);

    const firstWeekday = toMondayFirst(new Date(year, month - 1, 1).getDay());
    const totalDays = getDaysInMonth(year, month);
    const weeks = [];
    let currentWeek = new Array(7).fill(null);

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

export function getCalendarViewModel(year, month, lang) {
    const language = resolveLanguage(lang);
    const weeks = getMonthGrid(year, month).map((week) => Object.freeze([...week]));

    return Object.freeze({
        year,
        month,
        language,
        monthName: MONTH_NAMES[language][month - 1],
        dayNames: Object.freeze([...DAY_NAMES[language]]),
        labels: Object.freeze({ ...LABELS[language] }),
        weeks: Object.freeze(weeks)
    });
}
