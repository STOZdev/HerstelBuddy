import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/app/_server/auth/session";
import { recordAudit } from "@/app/_server/audit/audit";
import { minddistrictGateway, patientContext } from "@/app/_server/minddistrict";

export async function POST(_request: Request, context: { params: Promise<{ taskId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { taskId } = await context.params;
  try {
    const launch = await minddistrictGateway().createLaunch(patientContext(session), taskId);
    await recordAudit({
      actorId: session.userId,
      action: "minddistrict.activity.launch",
      outcome: "success",
      correlationId: randomUUID(),
      resourceType: "Task",
      resourceId: taskId,
    });
    return NextResponse.json({ launch });
  } catch {
    return NextResponse.json({ error: "ASSIGNMENT_NOT_FOUND" }, { status: 404 });
  }
}
