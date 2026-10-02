export type NotificationPreference = {
  enabled: boolean;
  time: string;
  timeZone: string;
  updatedAt: string;
  lastSentSlot?: string;
};

export type StoredPushSubscription = {
  endpoint: string;
  expirationTime: number | null;
  keys: { p256dh: string; auth: string };
  createdAt: string;
  updatedAt: string;
};

export const DEFAULT_NOTIFICATION_PREFERENCE: Omit<NotificationPreference, "updatedAt"> = {
  enabled: false,
  time: "09:00",
  timeZone: "Europe/Amsterdam",
};

export function isReminderTime(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 100) return false;
  try {
    Intl.DateTimeFormat("nl-NL", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function notificationSlot(now: Date, timeZone: string) {
  const values = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now).reduce<Record<string, string>>((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function reminderIsDue(preference: NotificationPreference, now = new Date()) {
  const slot = notificationSlot(now, preference.timeZone);
  return slot.endsWith(preference.time) && preference.lastSentSlot !== slot;
}
