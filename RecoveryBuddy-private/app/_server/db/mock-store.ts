import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { MinddistrictAssignment } from "@/app/_domain/minddistrict/types";
import type { NotificationPreference, StoredPushSubscription } from "@/app/_server/notifications/types";

export type SyntheticPatient = {
  userId: string;
  displayName: string;
  subject: string;
  minddistrictTenant: string;
  minddistrictPatientId: string;
};

export type StoredRecoveryPlan = {
  goals: Array<{ id: string; text: string }>;
  actions: Array<Record<string, unknown>>;
  updatedAt: string;
};

export type AuditRecord = {
  id: string;
  occurredAt: string;
  actorId: string;
  action: string;
  outcome: "success" | "failure";
  resourceType?: string;
  resourceId?: string;
  correlationId: string;
};

export type MockStore = {
  patients: SyntheticPatient[];
  recoveryPlans: Record<string, StoredRecoveryPlan>;
  assignments: MinddistrictAssignment[];
  notificationPreferences: Record<string, NotificationPreference>;
  pushSubscriptions: Record<string, StoredPushSubscription[]>;
  audit: AuditRecord[];
};

const syntheticPatient: SyntheticPatient = {
  userId: "recovery-user-synthetic-001",
  displayName: "Sanne de Vries",
  subject: "md-subject-synthetic-001",
  minddistrictTenant: "umcu-demo",
  minddistrictPatientId: "md-patient-synthetic-001",
};

function seedStore(): MockStore {
  return {
    patients: [syntheticPatient],
    recoveryPlans: {
      [syntheticPatient.userId]: {
        goals: [{ id: "goal-synthetic-001", text: "Meer rust en overzicht in mijn week" }],
        actions: [
          {
            id: 1001,
            goalId: "goal-synthetic-001",
            text: "Twee keer per week bewust een herstelmoment plannen",
            completed: false,
            kind: "standard",
            category: "practice",
            schedule: { repeatMode: "recurring", frequency: "weekly", weekday: "wednesday", time: "19:00" },
            completionCount: 0,
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    },
    assignments: [],
    notificationPreferences: {},
    pushSubscriptions: {},
    audit: [],
  };
}

function dataFile() {
  const configured = process.env.RECOVERY_MOCK_DATA_FILE ?? ".data/recoverybuddy-mock.json";
  return path.join(process.cwd(), ".data", path.basename(configured));
}

async function writeStore(store: MockStore) {
  const filename = dataFile();
  await mkdir(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(store, null, 2), "utf8");
  await rename(temporary, filename);
}

export async function readStore(): Promise<MockStore> {
  try {
    const stored = JSON.parse(await readFile(dataFile(), "utf8")) as Partial<MockStore>;
    // Backward-compatible migration for existing local demonstration data.
    return {
      ...stored,
      patients: stored.patients ?? [],
      recoveryPlans: stored.recoveryPlans ?? {},
      assignments: stored.assignments ?? [],
      notificationPreferences: stored.notificationPreferences ?? {},
      pushSubscriptions: stored.pushSubscriptions ?? {},
      audit: stored.audit ?? [],
    };
  } catch (error) {
    const missing = error instanceof Error && "code" in error && error.code === "ENOENT";
    if (!missing) throw error;
    const seeded = seedStore();
    await writeStore(seeded);
    return seeded;
  }
}

let writeQueue = Promise.resolve();

export async function mutateStore<T>(mutation: (store: MockStore) => T | Promise<T>): Promise<T> {
  let result!: T;
  let failure: unknown;
  writeQueue = writeQueue.then(async () => {
    try {
      const store = await readStore();
      result = await mutation(store);
      await writeStore(store);
    } catch (error) {
      failure = error;
    }
  });
  await writeQueue;
  if (failure) throw failure;
  return result;
}

export async function findSyntheticPatient(minddistrictPatientId: string) {
  const store = await readStore();
  return store.patients.find((patient) => patient.minddistrictPatientId === minddistrictPatientId) ?? null;
}
