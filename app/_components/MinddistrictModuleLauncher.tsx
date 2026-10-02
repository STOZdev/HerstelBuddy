"use client";

import { useCallback, useEffect, useState } from "react";
import type { MinddistrictActivity, MinddistrictAssignment } from "@/app/_domain/minddistrict/types";

type Props = {
  patient: {
    displayName: string;
    minddistrictPatientId: string;
  };
};

const statusLabels: Record<MinddistrictAssignment["status"], string> = {
  assigned: "Toegewezen",
  "in-progress": "Gestart",
  completed: "Afgerond",
};

export default function MinddistrictModuleLauncher({ patient }: Props) {
  const [activities, setActivities] = useState<MinddistrictActivity[]>([]);
  const [assignments, setAssignments] = useState<MinddistrictAssignment[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Beschikbare Minddistrict-modules worden opgehaald…");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const [moduleResponse, assignmentResponse] = await Promise.all([
      fetch("/api/modules", { cache: "no-store" }),
      fetch("/api/assignments", { cache: "no-store" }),
    ]);
    if (!moduleResponse.ok || !assignmentResponse.ok) throw new Error("LOAD_FAILED");
    const moduleData = await moduleResponse.json() as { activities: MinddistrictActivity[] };
    const assignmentData = await assignmentResponse.json() as { assignments: MinddistrictAssignment[] };
    setActivities(moduleData.activities);
    setAssignments(assignmentData.assignments);
    setMessage(assignmentData.assignments.some((item) => item.status === "completed")
      ? "De teruggekeerde voortgang is verwerkt in RecoveryBuddy."
      : "De koppeling gebruikt in deze demonstratie synthetische gegevens.");
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setError("De mock-Minddistrictverbinding kon niet worden geladen.");
      setMessage("");
    });
  }, [refresh]);

  const activity = activities.find((item) => item.capability === "relapse_prevention") ?? activities[0];
  const assignment = activity
    ? assignments.find((item) => item.activityDefinitionId === activity.activityDefinitionId)
    : undefined;

  async function openModule() {
    if (!activity) return;
    setBusy(true);
    setError("");
    try {
      const assignmentResponse = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": `demo-${activity.capability}` },
        body: JSON.stringify({ capability: activity.capability }),
      });
      if (!assignmentResponse.ok) throw new Error("ASSIGN_FAILED");
      const assigned = await assignmentResponse.json() as { assignment: MinddistrictAssignment };
      const launchResponse = await fetch(`/api/assignments/${encodeURIComponent(assigned.assignment.taskId)}/launch`, {
        method: "POST",
      });
      if (!launchResponse.ok) throw new Error("LAUNCH_FAILED");
      const launch = await launchResponse.json() as { launch: { url: string } };
      window.location.assign(launch.launch.url);
    } catch {
      setError("De module kon niet worden geopend. Probeer het opnieuw.");
      setBusy(false);
    }
  }

  return (
    <section className="mock-md-card" aria-labelledby="minddistrict-module-title">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span className="mock-md-badge">✓ Gestart vanuit Minddistrict</span>
        <a href="/api/auth/logout" style={{ color: "#645b53", fontSize: ".85rem" }}>Mock-sessie afsluiten</a>
      </div>
      <div className="mock-md-grid">
        <div>
          <h1 className="mock-md-title" id="minddistrict-module-title">
            Welkom {patient.displayName} — open je Minddistrict-module
          </h1>
          <p className="mock-md-copy">
            {activity?.title ?? "Minddistrict-module laden"}
            {assignment ? ` · ${statusLabels[assignment.status]}` : " · Beschikbaar"}
          </p>
          <p className="mock-md-status">
            Accountkoppeling: <code>{patient.minddistrictPatientId}</code>. {message}
          </p>
          {error && <p className="mock-md-status mock-md-error" role="alert">{error}</p>}
        </div>
        <button className="mock-md-button" type="button" disabled={!activity || busy} onClick={openModule}>
          {busy ? "Module openen…" : assignment?.status === "completed" ? "Module opnieuw openen" : "Open in Minddistrict"}
        </button>
      </div>
    </section>
  );
}
