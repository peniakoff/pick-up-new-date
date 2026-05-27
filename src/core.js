export const DAY_NAMES = {
    eng: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    pl: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
    de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
};

export const MONTH_NAMES = {
    eng: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    pl: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
    de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
};

export const LABELS = {
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
};

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(year, month) {
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
