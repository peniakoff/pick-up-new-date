import assert from "node:assert/strict";
import test from "node:test";

import pickUpNewDate, {
    DAY_NAMES,
    getCalendarViewModel,
    getDaysInMonth,
    getMonthGrid,
    isLeapYear,
    resolveLanguage
} from "./src/index.js";

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
    assert.equal(Object.isFrozen(getCalendarViewModel(2024, 2, "eng").labels), false);
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
});

test("resolveLanguage falls back to english for unsupported values", () => {
    assert.equal(resolveLanguage(), "eng");
    assert.equal(resolveLanguage(""), "eng");
    assert.equal(resolveLanguage("es"), "eng");
    assert.equal(resolveLanguage("pl"), "pl");
});

test("pickUpNewDate validates target area", () => {
    const originalDocument = global.document;
    try {
        global.document = {
            getElementById() {
                return null;
            }
        };

        assert.throws(() => {
            pickUpNewDate("eng", "missing");
        }, /target area "missing" was not found/);
    } finally {
        global.document = originalDocument;
    }
});

test("pickUpNewDate is explicit about non-browser usage", () => {
    const originalDocument = global.document;
    try {
        global.document = undefined;

        assert.throws(() => {
            pickUpNewDate("eng", "calendar");
        }, /document is unavailable/);
    } finally {
        global.document = originalDocument;
    }
});

test("pickUpNewDate validates callback option type", () => {
    const originalDocument = global.document;
    try {
        global.document = {
            getElementById() {
                return null;
            }
        };

        assert.throws(() => {
            pickUpNewDate("eng", "calendar", { onDateSelect: "nope" });
        }, /options.onDateSelect must be a function/);
    } finally {
        global.document = originalDocument;
    }
});
