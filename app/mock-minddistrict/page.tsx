export const dynamic = "force-dynamic";

export default function MockMinddistrictPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#eef4f8" }}>
      <section style={{ width: "min(620px, 100%)", background: "white", borderRadius: 24, padding: 28, boxShadow: "0 18px 60px rgba(34, 65, 86, .13)" }}>
        <p style={{ margin: 0, color: "#2e718e", fontWeight: 850, letterSpacing: ".04em" }}>MINDDISTRICT · MOCK</p>
        <h1 style={{ margin: "10px 0 8px", fontSize: "clamp(1.6rem, 7vw, 2.4rem)" }}>Mijn behandeling</h1>
        <p style={{ color: "#526572", lineHeight: 1.6 }}>
          Deze pagina simuleert de bestaande Minddistrict-app. De patiënt bestaat al in het UMCU-demoaccount en start RecoveryBuddy via een vertrouwde launch.
        </p>
        <div style={{ border: "1px solid #d6e4ec", borderRadius: 18, padding: 18, margin: "22px 0" }}>
          <strong>Sanne de Vries</strong>
          <div style={{ color: "#647984", marginTop: 4 }}>Minddistrict ID: md-patient-synthetic-001</div>
          <div style={{ color: "#647984", marginTop: 4 }}>Beschikbare module: Terugvalpreventie</div>
        </div>
        <a
          href="/api/auth/mock-launch?patient=md-patient-synthetic-001"
          style={{ display: "block", textAlign: "center", textDecoration: "none", background: "#2e718e", color: "white", padding: "14px 18px", borderRadius: 14, fontWeight: 850 }}
        >
          Open RecoveryBuddy
        </a>
        <p style={{ color: "#71818a", fontSize: ".82rem", lineHeight: 1.5, marginBottom: 0 }}>
          Alleen synthetische gegevens. In productie wordt deze route vervangen door een door Minddistrict of Koppeltaal ondertekende OIDC/OAuth-launch.
        </p>
      </section>
    </main>
  );
}
