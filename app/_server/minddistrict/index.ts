import "server-only";

import type { RecoverySession } from "@/app/_server/auth/session";
import type { MinddistrictGateway, PatientContext } from "./gateway";
import { MockMinddistrictGateway } from "./mock-gateway";

export function patientContext(session: RecoverySession): PatientContext {
  return {
    userId: session.userId,
    minddistrictPatientId: session.minddistrictPatientId,
    tenant: session.minddistrictTenant,
  };
}

export function minddistrictGateway(): MinddistrictGateway {
  const mode = process.env.MINDDISTRICT_MODE ?? "mock";
  if (mode !== "mock") {
    throw new Error(`Minddistrict mode '${mode}' is not configured in this mock-up`);
  }
  return new MockMinddistrictGateway();
}
