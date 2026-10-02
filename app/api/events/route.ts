import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/_server/auth/session";
import { recordAudit } from "@/app/_server/audit/audit";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const body = await request.json().catch(() => null) as { event?: unknown; stepId?: unknown; flowVersion?: unknown } | null;
  if (
    !body ||
    body.event !== "flow_step_viewed" ||
    typeof body.stepId !== "string" || body.stepId.length > 60 ||
    typeof body.flowVersion !== "string" || body.flowVersion.length > 60
  ) return NextResponse.json({ error: "INVALID_EVENT" }, { status: 400 });
  await recordAudit({
    actorId: session.userId,
    action: `flow.view.${body.stepId}`,
    outcome: "success",
    correlationId: randomUUID(),
    resourceType: "FlowVersion",
    resourceId: body.flowVersion,
  });
  return new NextResponse(null, { status: 204 });
}
