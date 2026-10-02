import { notFound, redirect } from "next/navigation";
import { getSession } from "@/app/_server/auth/session";
import { minddistrictGateway, patientContext } from "@/app/_server/minddistrict";

export const dynamic = "force-dynamic";

export default async function MockModulePage({ params }: { params: Promise<{ taskId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/mock-minddistrict");
  const { taskId } = await params;
  const gateway = minddistrictGateway();
  const context = patientContext(session);
  const assignment = await gateway.getAssignment(context, taskId);
  if (!assignment) notFound();
  const activities = await gateway.listActivities(context);
  const activity = activities.find((item) => item.activityDefinitionId === assignment.activityDefinitionId);
  if (!activity) notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#eef4f8", padding: "18px 12px 40px" }}>
      <section style={{ width: "min(760px, 100%)", margin: "0 auto", background: "white", borderRadius: 24, overflow: "hidden", boxShadow: "0 18px 60px rgba(34,65,86,.13)" }}>
        <header style={{ padding: "18px 24px", background: "#2e718e", color: "white" }}>
          <div style={{ fontWeight: 900, letterSpacing: ".04em" }}>MINDDISTRICT · MOCK MODULE</div>
          <div style={{ fontSize: ".85rem", opacity: .88, marginTop: 4 }}>Ingelogd als {session.displayName}</div>
        </header>
        <article style={{ padding: "clamp(22px, 5vw, 42px)" }}>
          <p style={{ color: "#2e718e", fontWeight: 850, marginTop: 0 }}>MODULE 1 VAN 1</p>
          <h1 style={{ fontSize: "clamp(1.65rem, 6vw, 2.5rem)", marginBottom: 12 }}>{activity.title}</h1>
          <p style={{ color: "#526572", lineHeight: 1.65 }}>{activity.description}</p>
          <div style={{ background: "#f2f7fa", borderRadius: 18, padding: 20, margin: "24px 0" }}>
            <h2 style={{ marginTop: 0 }}>Kleine oefening</h2>
            <p style={{ lineHeight: 1.65 }}>
              Denk aan één vroeg signaal waaraan je merkt dat spanning oploopt. Kies vervolgens één kleine actie die jou of iemand uit je netwerk kan helpen om tijdig bij te sturen.
            </p>
            <label style={{ display: "grid", gap: 8, fontWeight: 750 }}>
              Mijn eerste helpende stap
              <textarea
                defaultValue="Ik bespreek het met iemand die ik vertrouw."
                rows={3}
                style={{ resize: "vertical", border: "1px solid #b8ccd6", borderRadius: 12, padding: 12, font: "inherit" }}
              />
            </label>
          </div>
          <form action={`/api/assignments/${encodeURIComponent(taskId)}/complete`} method="post">
            <button type="submit" style={{ width: "100%", border: 0, borderRadius: 14, padding: 14, background: "#2e718e", color: "white", fontWeight: 850, cursor: "pointer" }}>
              Afronden en terug naar RecoveryBuddy
            </button>
          </form>
          <p style={{ color: "#71818a", fontSize: ".82rem", lineHeight: 1.5 }}>
            Dit is een lokale simulatie van een bestaande Minddistrict-module. De vrije tekst wordt in deze mock niet opgeslagen; alleen de taakstatus wordt teruggegeven.
          </p>
        </article>
      </section>
    </main>
  );
}
