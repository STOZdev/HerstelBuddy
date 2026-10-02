import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { mutateStore, readStore } from "@/app/_server/db/mock-store";
import { reminderIsDue, notificationSlot } from "@/app/_server/notifications/types";
import { sendWebPush, vapidConfiguration } from "@/app/_server/notifications/web-push";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const secret = process.env.REMINDER_DISPATCH_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !supplied) return false;
  const expected = Buffer.from(secret);
  const received = Buffer.from(supplied);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!vapidConfiguration()) return NextResponse.json({ error: "PUSH_NOT_CONFIGURED" }, { status: 503 });

  const now = new Date();
  const store = await readStore();
  const due = Object.entries(store.notificationPreferences).filter(([, preference]) => reminderIsDue(preference, now));
  let delivered = 0;
  const successfulUsers: Array<{ userId: string; slot: string }> = [];
  const expired: Array<{ userId: string; endpoint: string }> = [];

  for (const [userId, preference] of due) {
    const subscriptions = store.pushSubscriptions[userId] ?? [];
    const results = await Promise.all(subscriptions.map(async (subscription) => ({ subscription, result: await sendWebPush(subscription, {
      title: "Een moment met je herstelbuddy",
      body: "Neem een klein moment voor wat voor jou vandaag belangrijk is.",
      tag: "recoverybuddy-daily-reminder",
    }).catch(() => ({ ok: false, status: 0 })) })));
    const sent = results.filter(({ result }) => result.ok).length;
    delivered += sent;
    if (sent) successfulUsers.push({ userId, slot: notificationSlot(now, preference.timeZone) });
    results.filter(({ result }) => result.status === 404 || result.status === 410).forEach(({ subscription }) => expired.push({ userId, endpoint: subscription.endpoint }));
  }

  if (successfulUsers.length || expired.length) await mutateStore((nextStore) => {
    successfulUsers.forEach(({ userId, slot }) => {
      const preference = nextStore.notificationPreferences[userId];
      if (preference) preference.lastSentSlot = slot;
    });
    expired.forEach(({ userId, endpoint }) => {
      nextStore.pushSubscriptions[userId] = (nextStore.pushSubscriptions[userId] ?? []).filter((item) => item.endpoint !== endpoint);
    });
  });
  return NextResponse.json({ due: due.length, delivered });
}
