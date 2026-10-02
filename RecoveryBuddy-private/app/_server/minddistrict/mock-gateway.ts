import "server-only";

import { randomUUID } from "node:crypto";
import type {
  LaunchContext,
  MinddistrictActivity,
  MinddistrictAssignment,
  MinddistrictCapability,
} from "@/app/_domain/minddistrict/types";
import { mutateStore, readStore } from "@/app/_server/db/mock-store";
import type { MinddistrictGateway, PatientContext } from "./gateway";

const activities: MinddistrictActivity[] = [
  {
    activityDefinitionId: "ActivityDefinition/md-relapse-prevention-001",
    capability: "relapse_prevention",
    title: "Terugvalpreventie: signalen en acties",
    description: "Een bestaande Minddistrict-module om vroege signalen te herkennen en passende acties vast te leggen.",
    provider: "minddistrict",
    version: "2026.1-mock",
    available: true,
  },
  {
    activityDefinitionId: "ActivityDefinition/md-act-001",
    capability: "act",
    title: "ACT: omgaan met moeilijke gedachten",
    description: "Een bestaande Minddistrict-module met uitleg en oefeningen uit ACT.",
    provider: "minddistrict",
    version: "2026.1-mock",
    available: true,
  },
];

function activityFor(capability: MinddistrictCapability) {
  const activity = activities.find((candidate) => candidate.capability === capability && candidate.available);
  if (!activity) throw new Error("ACTIVITY_NOT_AVAILABLE");
  return activity;
}

function ensurePatient(assignment: MinddistrictAssignment | undefined, context: PatientContext) {
  if (!assignment || assignment.patientId !== context.minddistrictPatientId) {
    throw new Error("ASSIGNMENT_NOT_FOUND");
  }
  return assignment;
}

export class MockMinddistrictGateway implements MinddistrictGateway {
  async listActivities(_context: PatientContext) {
    return activities.filter((activity) => activity.available);
  }

  async assignActivity(context: PatientContext, capability: MinddistrictCapability) {
    const activity = activityFor(capability);
    return mutateStore((store) => {
      const existing = store.assignments.find(
        (assignment) =>
          assignment.patientId === context.minddistrictPatientId &&
          assignment.activityDefinitionId === activity.activityDefinitionId &&
          assignment.status !== "completed",
      );
      if (existing) return existing;

      const assignment: MinddistrictAssignment = {
        taskId: `mock-task-${randomUUID()}`,
        patientId: context.minddistrictPatientId,
        activityDefinitionId: activity.activityDefinitionId,
        status: "assigned",
        assignedAt: new Date().toISOString(),
      };
      store.assignments.push(assignment);
      return assignment;
    });
  }

  async createLaunch(context: PatientContext, taskId: string): Promise<LaunchContext> {
    const assignment = await mutateStore((store) => {
      const current = ensurePatient(store.assignments.find((item) => item.taskId === taskId), context);
      if (current.status === "assigned") {
        current.status = "in-progress";
        current.startedAt = new Date().toISOString();
      }
      return current;
    });
    return {
      url: `/mock-minddistrict/module/${encodeURIComponent(assignment.taskId)}`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  }

  async getAssignments(context: PatientContext) {
    const store = await readStore();
    return store.assignments.filter((assignment) => assignment.patientId === context.minddistrictPatientId);
  }

  async getAssignment(context: PatientContext, taskId: string) {
    const store = await readStore();
    return store.assignments.find(
      (assignment) => assignment.taskId === taskId && assignment.patientId === context.minddistrictPatientId,
    ) ?? null;
  }

  async completeAssignment(context: PatientContext, taskId: string) {
    return mutateStore((store) => {
      const assignment = ensurePatient(store.assignments.find((item) => item.taskId === taskId), context);
      assignment.status = "completed";
      assignment.completedAt = new Date().toISOString();
      return assignment;
    });
  }
}

export const mockMinddistrictActivities = activities;
