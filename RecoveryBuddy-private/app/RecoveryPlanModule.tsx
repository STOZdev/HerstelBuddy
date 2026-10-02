"use client";

import { useEffect, useState, type CSSProperties } from "react";

type RecoveryPlanProfile = {
  story: string;
  strengths: string;
  networkIntake: string;
};

type Props = { onBack: () => void };

const storageKey = "recovery-buddy:recovery-plan-profile:v1";
const emptyProfile: RecoveryPlanProfile = {
  story: "",
  strengths: "",
  networkIntake: "",
};

function isProfile(value: unknown): value is RecoveryPlanProfile {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.story === "string" &&
    typeof item.strengths === "string" &&
    typeof item.networkIntake === "string";
}

export default function RecoveryPlanModule({ onBack }: Props) {
  const [profile, setProfile] = useState<RecoveryPlanProfile>(emptyProfile);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (isProfile(stored)) setProfile(stored);
    } catch {
      setNotice("Je eerdere gegevens konden niet worden geladen.");
    }
    setReady(true);
  }, []);

  function update(field: keyof RecoveryPlanProfile, value: string) {
    setProfile(current => ({ ...current, [field]: value }));
    setNotice("");
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(profile));
      setNotice("Je herstelplan is opgeslagen in deze browser.");
    } catch {
      setNotice("Opslaan is niet gelukt. Je antwoorden staan nog in dit scherm.");
    }
  }

  if (!ready) return <p role="status">Herstelplan laden…</p>;

  return (
    <section style={styles.shell} aria-labelledby="recovery-plan-title">
      <button type="button" style={styles.backButton} onClick={onBack}>← Terug naar Home</button>
      <p style={styles.eyebrow}>MIJN HERSTELPLAN</p>
      <h1 id="recovery-plan-title" style={styles.title}>Mijn verhaal en krachtbronnen</h1>
      <p style={styles.intro}>
        Leg hier vast wat voor jou belangrijk is. Je kunt de tekst later altijd aanvullen of aanpassen.
      </p>

      <label style={styles.field}>
        <strong>Mijn verhaal</strong>
        <span>Wat is belangrijk om over jou, je leven en je herstel te weten?</span>
        <textarea style={styles.textarea} rows={7} value={profile.story} onChange={event => update("story", event.target.value)} placeholder="Schrijf hier in je eigen woorden…" />
      </label>

      <label style={styles.field}>
        <strong>Mijn krachtbronnen</strong>
        <span>Welke mensen, eigenschappen, activiteiten en plekken geven je steun of kracht?</span>
        <textarea style={styles.textarea} rows={7} value={profile.strengths} onChange={event => update("strengths", event.target.value)} placeholder="Bijvoorbeeld: mijn familie, muziek, humor of wandelen…" />
      </label>

      <label style={styles.field}>
        <strong>Plaats hier de netwerkintake</strong>
        <span>Plak hier de samenvatting of relevante afspraken uit je netwerkintake.</span>
        <textarea style={styles.textarea} rows={9} value={profile.networkIntake} onChange={event => update("networkIntake", event.target.value)} placeholder="Plak of schrijf hier de netwerkintake…" />
      </label>

      {notice && <p role="status" style={styles.notice}>{notice}</p>}
      <button type="button" style={styles.saveButton} onClick={save}>Herstelplan opslaan</button>
      <button type="button" style={styles.secondaryButton} onClick={onBack}>Terug naar Home</button>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: { maxWidth: 680, margin: "0 auto", padding: "8px 0 30px" },
  backButton: { border: 0, background: "transparent", color: "#5b55bd", fontWeight: 800, cursor: "pointer", padding: "4px 0 12px" },
  eyebrow: { margin: "8px 0", color: "#7168b7", fontSize: 12, fontWeight: 800, letterSpacing: "0.12em" },
  title: { margin: "8px 0 12px", color: "#302b50", fontSize: "clamp(28px, 5vw, 40px)", lineHeight: 1.15 },
  intro: { margin: "0 0 22px", color: "#625b77", fontSize: 16, lineHeight: 1.55 },
  field: { display: "grid", gap: 7, margin: "14px 0", padding: 16, border: "1px solid #e4ddef", borderRadius: 18, background: "rgba(255,255,255,0.78)", color: "#403a5b" },
  textarea: { width: "100%", boxSizing: "border-box", resize: "vertical", border: "1px solid #dcd5eb", borderRadius: 12, padding: 12, background: "#fff", color: "#302b50", font: "inherit", lineHeight: 1.5 },
  notice: { padding: "11px 13px", borderRadius: 12, background: "#f1effa", color: "#4f486b" },
  saveButton: { width: "100%", border: 0, borderRadius: 16, padding: "15px 18px", background: "linear-gradient(135deg,#5657df,#7864e8)", color: "white", fontSize: 16, fontWeight: 800, cursor: "pointer", marginTop: 10 },
  secondaryButton: { width: "100%", border: 0, background: "transparent", padding: "13px 18px", color: "#5b55bd", fontWeight: 800, cursor: "pointer" },
};
