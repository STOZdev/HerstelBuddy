import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/_server/auth/session";
import { recordAudit } from "@/app/_server/audit/audit";
import { minddistrictGateway, patientContext } from "@/app/_server/minddistrict";

export async function POST(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { taskId } = await context.params;
  try {
    await minddistrictGateway().completeAssignment(patientContext(session), taskId);
    await recordAudit({
      actorId: session.userId,
      action: "minddistrict.activity.complete",
      outcome: "success",
      correlationId: randomUUID(),
      resourceType: "Task",
      resourceId: taskId,
    });
    return NextResponse.redirect(new URL("/?returnedFrom=minddistrict", request.url), 303);
  } catch {
    return NextResponse.json({ error: "ASSIGNMENT_NOT_FOUND" }, { status: 404 });
  }
}
