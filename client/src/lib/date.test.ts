import { describe, expect, it } from "vitest";
import { relativeTime, formatDate, formatDateTime } from "./date";

describe("relativeTime", () => {
  it("returns empty string for invalid dates", () => {
    expect(relativeTime("not-a-date")).toBe("");
  });

  it("returns 'Just now' for very recent timestamps", () => {
    expect(relativeTime(new Date().toISOString())).toBe("Just now");
  });

  it("returns minutes ago within the hour", () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(relativeTime(tenMinutesAgo)).toBe("10 min ago");
  });

  it("returns hours ago within 24h", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(threeHoursAgo)).toBe("3 hours ago");
  });

  it("returns 'Yesterday' for a day ago", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(yesterday)).toBe("Yesterday");
  });

  it("falls back to a formatted date for older timestamps", () => {
    const old = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(old)).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
  });
});

describe("formatDate", () => {
  it("formats an ISO date as 'Mon D, YYYY'", () => {
    expect(formatDate("2026-08-19T12:00:00Z")).toBe("Aug 19, 2026");
  });

  it("returns empty string for invalid input", () => {
    expect(formatDate("nope")).toBe("");
  });
});

describe("formatDateTime", () => {
  it("includes a time component", () => {
    const output = formatDateTime("2026-08-19T12:00:00Z");
    expect(output).toContain("2026");
    expect(output).toContain(":");
  });
});