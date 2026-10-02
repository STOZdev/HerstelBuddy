import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/_server/auth/session";
import { mutateStore, readStore, type StoredRecoveryPlan } from "@/app/_server/db/mock-store";

function validPlan(value: unknown): value is Pick<StoredRecoveryPlan, "goals" | "actions"> {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { goals?: unknown; actions?: unknown };
  if (!Array.isArray(candidate.goals) || !Array.isArray(candidate.actions)) return false;
  if (candidate.goals.length > 50 || candidate.actions.length > 250) return false;
  return candidate.goals.every((goal) => {
    if (!goal || typeof goal !== "object") return false;
    const item = goal as { id?: unknown; text?: unknown };
    return typeof item.id === "string" && item.id.length <= 100 && typeof item.text === "string" && item.text.trim().length > 0 && item.text.length <= 500;
  });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const store = await readStore();
  const plan = store.recoveryPlans[session.userId] ?? { goals: [], actions: [], updatedAt: new Date().toISOString() };
  return NextResponse.json({ plan });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const raw = await request.text();
  if (raw.length > 250_000) return NextResponse.json({ error: "PLAN_TOO_LARGE" }, { status: 413 });
  const body = (() => { try { return JSON.parse(raw) as unknown; } catch { return null; } })();
  if (!validPlan(body)) return NextResponse.json({ error: "INVALID_PLAN" }, { status: 400 });
  const plan: StoredRecoveryPlan = {
    goals: body.goals.map((goal) => ({ id: goal.id, text: goal.text.trim() })),
    actions: body.actions,
    updatedAt: new Date().toISOString(),
  };
  await mutateStore((store) => { store.recoveryPlans[session.userId] = plan; });
  return NextResponse.json({ plan });
}
