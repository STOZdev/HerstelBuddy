import { NextResponse } from "next/server";
import { vapidConfiguration } from "@/app/_server/notifications/web-push";

export const dynamic = "force-dynamic";

export async function GET() {
  const configuration = vapidConfiguration();
  return NextResponse.json({ pushConfigured: Boolean(configuration), publicKey: configuration?.publicKey });
}
