import { describe, expect, it } from "vitest";

import {
  compareCalendarDates,
  formatCalendarDate,
  getCalendarDateTimestamp,
  getCalendarDayDifference,
  isCalendarDateInCurrentMonth,
  isPastCalendarDate,
  toDateInputValue,
  toIsoDateTimeValue,
} from "./format";

describe("calendar date helpers", () => {
  it("formats plain calendar dates without timezone drift", () => {
    expect(formatCalendarDate("2026-05-16")).toBe("16.05.2026");
    expect(formatCalendarDate("2026-05-16T00:00:00.000Z")).toBe("16.05.2026");
  });

  it("extracts date input values from plain dates and timestamps", () => {
    expect(toDateInputValue("2026-05-16")).toBe("2026-05-16");
    expect(toDateInputValue("2026-05-16T23:15:00.000Z")).toBe("2026-05-16");
    expect(toDateInputValue("invalid")).toBe("");
  });

  it("compares calendar dates independent of time information", () => {
    expect(compareCalendarDates("2026-05-16", "2026-05-17")).toBeLessThan(0);
    expect(compareCalendarDates("2026-05-17", "2026-05-16", "desc")).toBeLessThan(0);
    expect(
      compareCalendarDates("2026-05-16T23:59:00.000Z", "2026-05-16"),
    ).toBe(0);
  });

  it("detects past dates against a reference date", () => {
    const referenceDate = new Date("2026-05-16T12:00:00.000Z");

    expect(isPastCalendarDate("2026-05-15", referenceDate)).toBe(true);
    expect(isPastCalendarDate("2026-05-16", referenceDate)).toBe(false);
  });

  it("detects dates in the same month as the reference date", () => {
    const referenceDate = new Date("2026-05-16T12:00:00.000Z");

    expect(isCalendarDateInCurrentMonth("2026-05-01", referenceDate)).toBe(
      true,
    );
    expect(isCalendarDateInCurrentMonth("2026-06-01", referenceDate)).toBe(
      false,
    );
  });

  it("calculates day differences from calendar dates", () => {
    expect(
      getCalendarDayDifference("2026-05-16", "2026-05-18T08:30:00.000Z"),
    ).toBe(2);
    expect(getCalendarDayDifference("invalid", "2026-05-18T08:30:00.000Z")).toBe(
      null,
    );
  });

  it("creates sortable timestamps for calendar dates", () => {
    expect(getCalendarDateTimestamp("2026-05-16", 3, 30)).toBe(
      Date.UTC(2026, 4, 16, 3, 30),
    );
    expect(getCalendarDateTimestamp("invalid")).toBe(null);
  });

  it("converts local datetime input values to ISO timestamps", () => {
    expect(toIsoDateTimeValue("2026-05-20T09:22")).toMatch(
      /^2026-05-20T\d{2}:22:00\.000Z$/,
    );
    expect(toIsoDateTimeValue("invalid")).toBe(undefined);
  });
});
