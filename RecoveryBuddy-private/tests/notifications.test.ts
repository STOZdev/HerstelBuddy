import { describe, expect, it } from "vitest";
import { isReminderTime, isValidTimeZone, notificationSlot, reminderIsDue, type NotificationPreference } from "../app/_server/notifications/types";

describe("notification scheduling", () => {
  it("validates a chosen time and IANA timezone", () => {
    expect(isReminderTime("09:15")).toBe(true);
    expect(isReminderTime("25:15")).toBe(false);
    expect(isValidTimeZone("Europe/Amsterdam")).toBe(true);
    expect(isValidTimeZone("Not/A-Timezone")).toBe(false);
  });

  it("uses the user's local timezone and does not repeat the same minute", () => {
    const now = new Date("2026-10-01T07:15:20.000Z"); // 09:15 in Amsterdam (CEST)
    const preference: NotificationPreference = { enabled: true, time: "09:15", timeZone: "Europe/Amsterdam", updatedAt: now.toISOString() };
    expect(notificationSlot(now, preference.timeZone)).toBe("2026-10-01T09:15");
    expect(reminderIsDue(preference, now)).toBe(true);
    preference.lastSentSlot = "2026-10-01T09:15";
    expect(reminderIsDue(preference, now)).toBe(false);
  });
});
