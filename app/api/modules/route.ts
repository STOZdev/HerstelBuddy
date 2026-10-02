import { NextResponse } from "next/server";
import { getSession } from "@/app/_server/auth/session";
import { minddistrictGateway, patientContext } from "@/app/_server/minddistrict";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const activities = await minddistrictGateway().listActivities(patientContext(session));
  return NextResponse.json({ activities });
}
