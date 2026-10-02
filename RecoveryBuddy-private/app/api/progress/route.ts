import { NextResponse } from "next/server";
import { getSession } from "@/app/_server/auth/session";
import { readStore } from "@/app/_server/db/mock-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const plan = (await readStore()).recoveryPlans[session.userId] ?? { goals: [], actions: [], updatedAt: new Date().toISOString() };
  const actions = plan.actions.filter((item): item is { completed?: unknown; completionCount?: unknown } => Boolean(item && typeof item === "object"));
  return NextResponse.json({
    progress: {
      goalsTotal: plan.goals.length,
      actionsTotal: actions.length,
      completedActions: actions.filter((action) => action.completed === true).length,
      completedRepetitions: actions.reduce((sum, action) => sum + (typeof action.completionCount === "number" ? action.completionCount : 0), 0),
      updatedAt: plan.updatedAt,
    },
  });
}
