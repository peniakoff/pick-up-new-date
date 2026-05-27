(function (global) {
    "use strict";

    const DAY_NAMES = {
        eng: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        pl: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
        de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    };

    const MONTH_NAMES = {
        eng: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        pl: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
        de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
    };

    const LABELS = {
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

    // Gregorian calendar: century years are leap years only when divisible by 400.
    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    function getDaysInMonth(year, month) {
        if (month === 2 && isLeapYear(year)) {
            return 29;
        }
        return MONTH_DAYS[month - 1];
    }

    function resolveLanguage(lang) {
        if (!lang || !DAY_NAMES[lang]) {
            return "eng";
        }
        return lang;
    }

    function toMondayFirst(day) {
        return day === 0 ? 7 : day;
    }

    function getMonthGrid(year, month) {
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

    class Calendar {
        constructor(lang, area, options) {
            this.lang = resolveLanguage(lang);
            this.options = options || {};
            this.root = typeof area === "string" ? document.getElementById(area) : area;

            if (!this.root) {
                throw new Error('PickUpNewDate: target area "' + area + '" was not found.');
            }

            this.today = new Date();
            this.currentMonth = this.today.getMonth() + 1;
            this.currentYear = this.today.getFullYear();
            this.handleKeydown = this.handleKeydown.bind(this);
            this.render();
        }

        get monthName() {
            return MONTH_NAMES[this.lang][this.currentMonth - 1];
        }

        get labels() {
            return LABELS[this.lang];
        }

        prevMonth() {
            if (this.currentMonth === 1) {
                this.currentMonth = 12;
                this.currentYear -= 1;
            } else {
                this.currentMonth -= 1;
            }
            this.render();
        }

        nextMonth() {
            if (this.currentMonth === 12) {
                this.currentMonth = 1;
                this.currentYear += 1;
            } else {
                this.currentMonth += 1;
            }
            this.render();
        }

        selectDate(day) {
            if (typeof this.options.onDateSelect === "function") {
                this.options.onDateSelect(new Date(this.currentYear, this.currentMonth - 1, day));
            }
        }

        handleKeydown(event) {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                this.prevMonth();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                this.nextMonth();
            }
        }

        createNavigationButton(icon, label, action) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "calendarNavButton";
            button.setAttribute("aria-label", label);
            button.addEventListener("click", action);

            const iconNode = document.createElement("span");
            iconNode.className = "calendarNavIcon";
            iconNode.setAttribute("aria-hidden", "true");
            iconNode.textContent = icon;
            button.appendChild(iconNode);

            return button;
        }

        createDayButton(day) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "calendarDayButton";
            button.textContent = day;
            button.setAttribute("aria-label", `${this.labels.chooseDate}: ${day} ${this.monthName} ${this.currentYear}`);

            if (
                day === this.today.getDate() &&
                this.currentMonth === this.today.getMonth() + 1 &&
                this.currentYear === this.today.getFullYear()
            ) {
                button.classList.add("today");
                button.setAttribute("aria-current", "date");
            }

            button.addEventListener("click", () => {
                this.selectDate(day);
            });

            return button;
        }

        render() {
            const table = document.createElement("table");
            const thead = document.createElement("thead");
            const tbody = document.createElement("tbody");
            const navRow = document.createElement("tr");
            const daysRow = document.createElement("tr");
            const weeks = getMonthGrid(this.currentYear, this.currentMonth);
            const monthYearLabel = `${this.monthName}, ${this.currentYear}`;

            table.className = "calendar";
            table.setAttribute("role", "grid");
            table.setAttribute("aria-label", `${this.labels.calendar}: ${this.monthName} ${this.currentYear}`);
            table.tabIndex = 0;
            table.addEventListener("keydown", this.handleKeydown);

            const caption = document.createElement("caption");
            caption.className = "calendarCaption";
            caption.textContent = monthYearLabel;
            table.appendChild(caption);

            const prevCell = document.createElement("td");
            prevCell.className = "monthHeader";
            prevCell.appendChild(this.createNavigationButton("‹", this.labels.previousMonth, () => {
                this.prevMonth();
            }));

            const titleCell = document.createElement("td");
            titleCell.className = "monthHeader";
            titleCell.colSpan = 5;
            titleCell.textContent = monthYearLabel;

            const nextCell = document.createElement("td");
            nextCell.className = "monthHeader";
            nextCell.appendChild(this.createNavigationButton("›", this.labels.nextMonth, () => {
                this.nextMonth();
            }));

            navRow.appendChild(prevCell);
            navRow.appendChild(titleCell);
            navRow.appendChild(nextCell);
            thead.appendChild(navRow);

            DAY_NAMES[this.lang].forEach((dayName) => {
                const headerCell = document.createElement("th");
                headerCell.className = "weekDayName";
                headerCell.scope = "col";
                headerCell.textContent = dayName;
                daysRow.appendChild(headerCell);
            });
            thead.appendChild(daysRow);

            weeks.forEach((week) => {
                const row = document.createElement("tr");

                week.forEach((day, index) => {
                    const cell = document.createElement("td");
                    cell.setAttribute("role", "gridcell");

                    if (day) {
                        cell.classList.add("currentMonth");
                        if (index === 5) {
                            cell.classList.add("saturday");
                        }
                        if (index === 6) {
                            cell.classList.add("sunday");
                        }
                        cell.appendChild(this.createDayButton(day));
                    } else {
                        cell.classList.add("emptyDay");
                        cell.setAttribute("aria-hidden", "true");
                    }

                    row.appendChild(cell);
                });

                tbody.appendChild(row);
            });

            table.appendChild(thead);
            table.appendChild(tbody);

            this.root.replaceChildren(table);
        }
    }

    function pickUpNewDate(lang, area, options) {
        return new Calendar(lang, area, options);
    }

    global.pickUpNewDate = pickUpNewDate;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            Calendar,
            DAY_NAMES,
            MONTH_NAMES,
            LABELS,
            getDaysInMonth,
            getMonthGrid,
            isLeapYear,
            pickUpNewDate,
            resolveLanguage
        };
    }
}(typeof window !== "undefined" ? window : globalThis));
