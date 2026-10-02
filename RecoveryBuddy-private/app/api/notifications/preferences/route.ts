import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/_server/auth/session";
import { mutateStore, readStore } from "@/app/_server/db/mock-store";
import { DEFAULT_NOTIFICATION_PREFERENCE, isReminderTime, isValidTimeZone, type NotificationPreference } from "@/app/_server/notifications/types";

export const dynamic = "force-dynamic";

function fallbackPreference(): NotificationPreference {
  return { ...DEFAULT_NOTIFICATION_PREFERENCE, updatedAt: new Date().toISOString() };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const store = await readStore();
  return NextResponse.json({ preference: store.notificationPreferences[session.userId] ?? fallbackPreference() });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const body = await request.json().catch(() => null) as { enabled?: unknown; time?: unknown; timeZone?: unknown } | null;
  if (!body || typeof body.enabled !== "boolean" || !isReminderTime(body.time) || !isValidTimeZone(body.timeZone)) {
    return NextResponse.json({ error: "INVALID_NOTIFICATION_PREFERENCE" }, { status: 400 });
  }
  const { enabled, time, timeZone } = body as { enabled: boolean; time: string; timeZone: string };
  const preference = await mutateStore((store) => {
    const next: NotificationPreference = {
      enabled,
      time,
      timeZone,
      updatedAt: new Date().toISOString(),
      // A changed time must be eligible immediately; a same-time update keeps
      // the idempotency marker for the current minute.
      lastSentSlot: store.notificationPreferences[session.userId]?.time === time
        ? store.notificationPreferences[session.userId]?.lastSentSlot
        : undefined,
    };
    store.notificationPreferences[session.userId] = next;
    return next;
  });
  return NextResponse.json({ preference });
}
