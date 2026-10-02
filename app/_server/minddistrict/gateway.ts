import "server-only";

import type {
  LaunchContext,
  MinddistrictActivity,
  MinddistrictAssignment,
  MinddistrictCapability,
} from "@/app/_domain/minddistrict/types";

export type PatientContext = {
  userId: string;
  minddistrictPatientId: string;
  tenant: string;
};

export interface MinddistrictGateway {
  listActivities(context: PatientContext): Promise<MinddistrictActivity[]>;
  assignActivity(context: PatientContext, capability: MinddistrictCapability): Promise<MinddistrictAssignment>;
  createLaunch(context: PatientContext, taskId: string): Promise<LaunchContext>;
  getAssignments(context: PatientContext): Promise<MinddistrictAssignment[]>;
  getAssignment(context: PatientContext, taskId: string): Promise<MinddistrictAssignment | null>;
  completeAssignment(context: PatientContext, taskId: string): Promise<MinddistrictAssignment>;
}
