import "server-only";

import { randomUUID } from "node:crypto";
import { mutateStore } from "@/app/_server/db/mock-store";

export async function recordAudit(input: {
  actorId: string;
  action: string;
  outcome: "success" | "failure";
  correlationId: string;
  resourceType?: string;
  resourceId?: string;
}) {
  await mutateStore((store) => {
    store.audit.push({ id: randomUUID(), occurredAt: new Date().toISOString(), ...input });
    store.audit = store.audit.slice(-500);
  });
}
