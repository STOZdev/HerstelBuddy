import { NextResponse } from "next/server";
import { getSession } from "@/app/_server/auth/session";
import { mutateStore, readStore } from "@/app/_server/db/mock-store";
import { sendWebPush } from "@/app/_server/notifications/web-push";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const subscriptions = (await readStore()).pushSubscriptions[session.userId] ?? [];
  if (!subscriptions.length) return NextResponse.json({ error: "NO_PUSH_SUBSCRIPTION" }, { status: 409 });
  const results = await Promise.all(subscriptions.map(async (subscription) => ({ subscription, result: await sendWebPush(subscription, {
    title: "Een moment met je herstelbuddy",
    body: "Dit is een testmelding. Je persoonlijke herstelinhoud staat niet in meldingen.",
    tag: "recoverybuddy-test-reminder",
  }).catch(() => ({ ok: false, status: 0 })) })));
  const expired = results.filter(({ result }) => result.status === 404 || result.status === 410).map(({ subscription }) => subscription.endpoint);
  if (expired.length) await mutateStore((store) => {
    store.pushSubscriptions[session.userId] = (store.pushSubscriptions[session.userId] ?? []).filter((item) => !expired.includes(item.endpoint));
  });
  const delivered = results.filter(({ result }) => result.ok).length;
  return NextResponse.json({ delivered }, { status: delivered ? 200 : 502 });
}
