export type MinddistrictCapability =
  | "relapse_prevention"
  | "act"
  | "mindfulness"
  | "sleep";

export type MinddistrictActivity = {
  activityDefinitionId: string;
  capability: MinddistrictCapability;
  title: string;
  description: string;
  provider: "minddistrict";
  version: string;
  available: boolean;
};

export type AssignmentStatus = "assigned" | "in-progress" | "completed";

export type MinddistrictAssignment = {
  taskId: string;
  patientId: string;
  activityDefinitionId: string;
  status: AssignmentStatus;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
};

export type LaunchContext = {
  url: string;
  expiresAt: string;
};
