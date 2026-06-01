import assert from "node:assert/strict";
import test from "node:test";

import pickUpNewDate, {
    Calendar,
    DAY_NAMES,
    LABELS,
    createLocalDate,
    getCalendarViewModel,
    getDaysInMonth,
    getMonthGrid,
    isLeapYear,
    resolveLanguage
} from "./src/index.ts";

test("isLeapYear handles Gregorian leap year rules", () => {
    assert.equal(isLeapYear(2000), true);
    assert.equal(isLeapYear(1900), false);
    assert.equal(isLeapYear(2024), true);
    assert.equal(isLeapYear(2025), false);
});

test("getDaysInMonth uses corrected February length", () => {
    assert.equal(getDaysInMonth(2000, 2), 29);
    assert.equal(getDaysInMonth(1900, 2), 28);
    assert.equal(getDaysInMonth(2024, 2), 29);
    assert.equal(getDaysInMonth(2025, 2), 28);
});

test("getMonthGrid returns stable monday-first month layouts", () => {
    assert.deepEqual(getMonthGrid(2021, 2), [
        [1, 2, 3, 4, 5, 6, 7],
        [8, 9, 10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19, 20, 21],
        [22, 23, 24, 25, 26, 27, 28]
    ]);

    assert.deepEqual(getMonthGrid(2024, 2), [
        [null, null, null, 1, 2, 3, 4],
        [5, 6, 7, 8, 9, 10, 11],
        [12, 13, 14, 15, 16, 17, 18],
        [19, 20, 21, 22, 23, 24, 25],
        [26, 27, 28, 29, null, null, null]
    ]);
});

test("getMonthGrid does not mutate DAY_NAMES constants", () => {
    getMonthGrid(2024, 2);
    getMonthGrid(2024, 2);
    assert.equal(DAY_NAMES.eng.length, 7);
    assert.equal(DAY_NAMES.pl.length, 7);
    assert.equal(DAY_NAMES.de.length, 7);
});

test("calendar constants stay immutable for data integrity", () => {
    assert.equal(Object.isFrozen(DAY_NAMES), true);
    assert.equal(Object.isFrozen(DAY_NAMES.eng), true);
    assert.equal(Object.isFrozen(LABELS), true);
    assert.equal(Object.isFrozen(LABELS.eng), true);
});

test("calendar helpers reject invalid year and month inputs", () => {
    assert.throws(() => {
        getDaysInMonth(2024, 0);
    }, /month must be an integer between 1 and 12/);

    assert.throws(() => {
        getMonthGrid(0, 2);
    }, /year must be an integer between 1 and 9999/);
});

test("getCalendarViewModel provides framework-friendly data model", () => {
    const model = getCalendarViewModel(2024, 2, "pl");

    assert.equal(model.language, "pl");
    assert.equal(model.monthName, "Luty");
    assert.equal(model.dayNames.length, 7);
    assert.equal(Array.isArray(model.weeks), true);
    assert.equal(typeof model.labels.chooseDate, "string");
    assert.equal(Object.isFrozen(model), true);
    assert.equal(Object.isFrozen(model.dayNames), true);
    assert.equal(Object.isFrozen(model.labels), true);
    assert.equal(Object.isFrozen(model.weeks[0]), true);
});

test("resolveLanguage falls back to english for unsupported values", () => {
    assert.equal(resolveLanguage(), "eng");
    assert.equal(resolveLanguage(""), "eng");
    assert.equal(resolveLanguage("es"), "eng");
    assert.equal(resolveLanguage("pl"), "pl");
});

test("pickUpNewDate validates target area", () => {
    const mockDocument = createMockDocument();
    assert.throws(() => {
        pickUpNewDate("eng", "missing", { document: mockDocument });
    }, /target area "missing" was not found/);
});

test("pickUpNewDate is explicit about non-browser usage", () => {
    assert.throws(() => {
        pickUpNewDate("eng", "calendar");
    }, /document is unavailable/);
});

test("pickUpNewDate validates callback option type", () => {
    const mockDocument = createMockDocument();
    assert.throws(() => {
        pickUpNewDate("eng", "calendar", {
            document: mockDocument,
            onDateSelect: "nope" as unknown as (date: Date) => void
        });
    }, /options.onDateSelect must be a function/);
});

test("navigation does not move below minimum year", () => {
    const { calendar, root } = createCalendarInstance(1, 1);
    calendar.prevMonth();
    assert.equal(calendar.currentYear, 1);
    assert.equal(calendar.currentMonth, 1);
    const navButtons = root.querySelectorAll("button.calendarNavButton");
    assert.equal(navButtons[0]?.disabled, true);
});

test("navigation does not move above maximum year", () => {
    const { calendar, root } = createCalendarInstance(9999, 12);
    calendar.nextMonth();
    assert.equal(calendar.currentYear, 9999);
    assert.equal(calendar.currentMonth, 12);
    const navButtons = root.querySelectorAll("button.calendarNavButton");
    assert.equal(navButtons[navButtons.length - 1]?.disabled, true);
});

test("selectDate stores selection and marks selected day in DOM", () => {
    const { calendar, root } = createCalendarInstance(2024, 2);
    calendar.selectDate(15);
    const selected = calendar.getSelectedDate();
    assert.ok(selected);
    assert.equal(selected?.getFullYear(), 2024);
    assert.equal(selected?.getMonth(), 1);
    assert.equal(selected?.getDate(), 15);

    const selectedButton = root.querySelector("button.calendarDayButton.selected");
    assert.ok(selectedButton);
    assert.equal(selectedButton?.getAttribute("aria-selected"), "true");
    assert.equal(selectedButton?.textContent, "15");
});

test("goToDate updates visible month and optional selected day", () => {
    const { calendar } = createCalendarInstance(2024, 1);
    calendar.goToDate(2025, 6, 10);
    assert.equal(calendar.currentYear, 2025);
    assert.equal(calendar.currentMonth, 6);
    assert.equal(calendar.getSelectedDate()?.getDate(), 10);
});

test("destroy clears root and prevents further usage", () => {
    const { calendar, root } = createCalendarInstance(2024, 3);
    calendar.destroy();
    assert.equal(root.childElementCount, 0);
    assert.throws(() => {
        calendar.nextMonth();
    }, /destroyed/);
});

test("onMonthChange fires after month navigation", () => {
    const { calendar } = createCalendarInstance(2024, 5);
    const changes: Array<{ year: number; month: number }> = [];
    calendar.options.onMonthChange = (year, month) => {
        changes.push({ year, month });
    };
    calendar.nextMonth();
    assert.deepEqual(changes, [{ year: 2024, month: 6 }]);
});

test("onDateSelect callback receives local calendar date", () => {
    const { calendar } = createCalendarInstance(2024, 2);
    let selected: Date | undefined;
    calendar.options.onDateSelect = (date) => {
        selected = date;
    };
    calendar.selectDate(10);
    assert.ok(selected);
    assert.equal(selected?.getFullYear(), 2024);
    assert.equal(selected?.getMonth(), 1);
    assert.equal(selected?.getDate(), 10);
});

test("render includes aria-live region for month changes", () => {
    const { calendar, root } = createCalendarInstance(2024, 2);
    const liveRegion = root.querySelector(".calendarLiveRegion");
    assert.ok(liveRegion);
    assert.equal(liveRegion?.getAttribute("aria-live"), "polite");
    calendar.nextMonth();
    assert.match(liveRegion?.textContent ?? "", /2024/);
});

test("getMonthGrid uses correct weekday for year 50 (not mapped to 1950)", () => {
    const grid50 = getMonthGrid(50, 2);
    const grid1950 = getMonthGrid(1950, 2);

    assert.notDeepEqual(grid50, grid1950);

    assert.deepEqual(grid50, [
        [null, 1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12, 13],
        [14, 15, 16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25, 26, 27],
        [28, null, null, null, null, null, null]
    ]);
});

test("createLocalDate preserves years 1 through 99", () => {
    const d = createLocalDate(50, 3, 15);
    assert.equal(d.getFullYear(), 50);
    assert.equal(d.getMonth(), 2);
    assert.equal(d.getDate(), 15);
});

function createCalendarInstance(year: number, month: number) {
    const mockDocument = createMockDocument();
    const root = mockDocument.createElement("div");
    root.id = "calendar-root";
    mockDocument.registerElement(root);

    const initialDate = new Date(0);
    initialDate.setFullYear(year, month - 1, 1);

    const calendar = new Calendar("eng", "calendar-root", {
        document: mockDocument,
        initialDate
    });

    return { calendar, root, mockDocument };
}

function createMockDocument(): MockDocument {
    const elementsById = new Map<string, MockElement>();

    return {
        getElementById(id: string) {
            return elementsById.get(id) ?? null;
        },
        createElement(tagName: string) {
            return new MockElement(tagName);
        },
        registerElement(element: MockElement) {
            if (element.id) {
                elementsById.set(element.id, element);
            }
        }
    };
}

class MockElement {
    tagName: string;
    id = "";
    private _className = "";
    textContent = "";
    innerHTML = "";
    tabIndex = 0;
    colSpan = 1;
    scope = "";
    disabled = false;
    readonly classList = new MockClassList(this);
    readonly dataset: Record<string, string> = {};
    readonly attributes = new Map<string, string>();
    readonly children: MockElement[] = [];
    private readonly listeners = new Map<string, Set<EventListener>>();

    constructor(tagName: string) {
        this.tagName = tagName.toUpperCase();
    }

    get className(): string {
        return this._className;
    }

    set className(value: string) {
        this._className = value;
        this.classList.reset(value);
    }

    setAttribute(name: string, value: string): void {
        this.attributes.set(name, value);
        if (name === "aria-selected") {
            if (value === "true") {
                this.classList.add("selected");
            } else {
                this.classList.remove("selected");
            }
        }
        if (name === "aria-current" && value === "date") {
            this.classList.add("today");
        }
        if (name === "aria-disabled" && value === "true") {
            this.disabled = true;
        }
    }

    getAttribute(name: string): string | null {
        return this.attributes.get(name) ?? null;
    }

    appendChild(child: MockElement): MockElement {
        this.children.push(child);
        return child;
    }

    addEventListener(type: string, listener: EventListener): void {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type)?.add(listener);
    }

    removeEventListener(type: string, listener: EventListener): void {
        this.listeners.get(type)?.delete(listener);
    }

    replaceChildren(...nodes: MockElement[]): void {
        this.children.length = 0;
        nodes.forEach((node) => this.children.push(node));
    }

    querySelector(selector: string): MockElement | null {
        if (selector.startsWith("button.calendarDayButton[data-day=")) {
            const match = /data-day="(\d+)"/.exec(selector);
            const day = match?.[1];
            return this.findInTree(
                (element) => element.classList.contains("calendarDayButton") && element.dataset.day === day
            );
        }

        if (selector === "button.calendarDayButton.selected") {
            return this.findInTree(
                (element) =>
                    element.classList.contains("calendarDayButton") && element.classList.contains("selected")
            );
        }

        if (selector === ".calendarLiveRegion") {
            return this.findInTree((element) => element.classList.contains("calendarLiveRegion"));
        }

        return null;
    }

    querySelectorAll(selector: string): MockElement[] {
        if (selector === "button.calendarNavButton") {
            const matches: MockElement[] = [];
            this.walkTree((element) => {
                if (element.classList.contains("calendarNavButton")) {
                    matches.push(element);
                }
            });
            return matches;
        }
        return [];
    }

    get childElementCount(): number {
        return this.children.length;
    }

    focus(): void {
        // no-op for tests
    }

    private findInTree(predicate: (element: MockElement) => boolean): MockElement | null {
        if (predicate(this)) {
            return this;
        }
        for (const child of this.children) {
            const found = child.findInTree(predicate);
            if (found) {
                return found;
            }
        }
        return null;
    }

    private walkTree(visitor: (element: MockElement) => void): void {
        visitor(this);
        this.children.forEach((child) => child.walkTree(visitor));
    }
}

class MockClassList {
    private readonly classes = new Set<string>();

    constructor(private readonly element: MockElement) {}

    add(...tokens: string[]): void {
        tokens.forEach((token) => this.classes.add(token));
        this.syncClassName();
    }

    remove(...tokens: string[]): void {
        tokens.forEach((token) => this.classes.delete(token));
        this.syncClassName();
    }

    contains(token: string): boolean {
        return this.classes.has(token);
    }

    reset(value: string): void {
        this.classes.clear();
        value
            .split(/\s+/)
            .filter(Boolean)
            .forEach((token) => this.classes.add(token));
        this.syncClassName();
    }

    private syncClassName(): void {
        this.element["_className"] = [...this.classes].join(" ");
    }
}

interface MockDocument {
    getElementById(id: string): MockElement | null;
    createElement(tagName: string): MockElement;
    registerElement(element: MockElement): void;
}
