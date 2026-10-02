import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/_server/auth/session";
import { mutateStore } from "@/app/_server/db/mock-store";
import type { StoredPushSubscription } from "@/app/_server/notifications/types";

export const dynamic = "force-dynamic";

function subscriptionFromBody(value: unknown): StoredPushSubscription | null {
  if (!value || typeof value !== "object") return null;
  const item = value as { endpoint?: unknown; expirationTime?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  if (typeof item.endpoint !== "string" || item.endpoint.length > 2_000 || !item.keys || typeof item.keys.p256dh !== "string" || typeof item.keys.auth !== "string") return null;
  try {
    if (new URL(item.endpoint).protocol !== "https:") return null;
  } catch { return null; }
  if (item.keys.p256dh.length > 200 || item.keys.auth.length > 100) return null;
  return {
    endpoint: item.endpoint,
    expirationTime: typeof item.expirationTime === "number" ? item.expirationTime : null,
    keys: { p256dh: item.keys.p256dh, auth: item.keys.auth },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const subscription = subscriptionFromBody(await request.json().catch(() => null));
  if (!subscription) return NextResponse.json({ error: "INVALID_PUSH_SUBSCRIPTION" }, { status: 400 });
  await mutateStore((store) => {
    const existing = store.pushSubscriptions[session.userId] ?? [];
    const previous = existing.find((item) => item.endpoint === subscription.endpoint);
    store.pushSubscriptions[session.userId] = [
      ...existing.filter((item) => item.endpoint !== subscription.endpoint),
      { ...subscription, createdAt: previous?.createdAt ?? subscription.createdAt },
    ].slice(-10);
  });
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const body = await request.json().catch(() => null) as { endpoint?: unknown } | null;
  if (!body || typeof body.endpoint !== "string" || body.endpoint.length > 2_000) return NextResponse.json({ error: "INVALID_PUSH_SUBSCRIPTION" }, { status: 400 });
  await mutateStore((store) => {
    store.pushSubscriptions[session.userId] = (store.pushSubscriptions[session.userId] ?? []).filter((item) => item.endpoint !== body.endpoint);
  });
  return new NextResponse(null, { status: 204 });
}
