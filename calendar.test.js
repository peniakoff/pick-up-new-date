const test = require("node:test");
const assert = require("node:assert/strict");

const {
    DAY_NAMES,
    getDaysInMonth,
    getMonthGrid,
    isLeapYear,
    pickUpNewDate,
    resolveLanguage
} = require("./calendar.js");

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

test("repeated helpers do not mutate shared dictionaries", () => {
    getMonthGrid(2024, 2);
    getMonthGrid(2024, 2);
    assert.equal(DAY_NAMES.eng.length, 7);
    assert.equal(DAY_NAMES.pl.length, 7);
    assert.equal(DAY_NAMES.de.length, 7);
});

test("resolveLanguage falls back to english for unsupported values", () => {
    assert.equal(resolveLanguage(), "eng");
    assert.equal(resolveLanguage(""), "eng");
    assert.equal(resolveLanguage("es"), "eng");
    assert.equal(resolveLanguage("pl"), "pl");
});

test("pickUpNewDate validates target area", () => {
    const originalDocument = global.document;
    global.document = {
        getElementById() {
            return null;
        }
    };

    assert.throws(() => {
        pickUpNewDate("eng", "missing");
    }, /target area "missing" was not found/);

    global.document = originalDocument;
});
