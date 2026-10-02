"use client";

import { useEffect, useState, type CSSProperties } from "react";

export type SignaleringsplanData = {
  green: { signals: string; helpful: string; people: string };
  orange: { signals: string; steps: string; support: string };
  red: { signals: string; steps: string; contacts: string };
};

type Props = {
  onFinish: (plan: SignaleringsplanData) => void;
  onBack: () => void;
  initialPlan?: SignaleringsplanData;
  linkedAction?: boolean;
};

const storageKey = "recovery-buddy:signaleringsplan:v1";
export function getCheckInPlanOptions(stored: unknown, score: 1 | 2 | 3 | 4) {
  const phase = score <= 2 ? "green" : score === 3 ? "orange" : "red";
  const label = phase === "green" ? "groene" : phase === "orange" ? "oranje" : "rode";
  const plan = stored && typeof stored === "object"
    ? (stored as { plan?: unknown }).plan : null;
  if (!validPlan(plan)) return { label, options: [] as string[] };
  const fields = phase === "green" ? [plan.green.helpful, plan.green.people]
    : phase === "orange" ? [plan.orange.steps, plan.orange.support]
    : [plan.red.steps, plan.red.contacts];
  // Alleen expliciete lijstregels splitsen; zinnen en telefoonnummers intact houden.
  const options = [...new Set(fields.flatMap(field => field.split(/\r?\n/))
    .map(line => line.trim().replace(/^(?:[-*•]|\d+[.)])\s+/, "").trim())
    .filter(Boolean))];
  return { label, options };
}

export function readCheckInPlanOptions(score: 1 | 2 | 3 | 4) {
  return getCheckInPlanOptions(JSON.parse(localStorage.getItem(storageKey) ?? "null"), score);
}
function validPlan(value: unknown): value is SignaleringsplanData {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return Object.entries(emptyPlan).every(([phase, fields]) => {
    const data = record[phase];
    return data !== null && typeof data === "object" &&
      Object.keys(fields).every(field => typeof (data as Record<string, unknown>)[field] === "string");
  });
}

const emptyPlan: SignaleringsplanData = {
  green: { signals: "", helpful: "", people: "" },
  orange: { signals: "", steps: "", support: "" },
  red: { signals: "", steps: "", contacts: "" },
};

const phases = [
  { key: "green", label: "Groene fase", color: "#18855b", background: "#e8f7ef" },
  { key: "orange", label: "Oranje fase", color: "#b86b00", background: "#fff3dc" },
  { key: "red", label: "Rode fase", color: "#b3313b", background: "#ffebed" },
] as const;

export default function SignaleringsplanModule({ onFinish, onBack, initialPlan, linkedAction = false }: Props) {
  const [screen, setScreen] = useState(0);
  const [plan, setPlan] = useState<SignaleringsplanData>(emptyPlan);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (initialPlan && validPlan(initialPlan)) {
        setPlan(initialPlan); setScreen(4); setSaved(true);
      } else if (stored && validPlan(stored.plan)) {
        setPlan(stored.plan); setSaved(stored.saved === true);
        setScreen(stored.saved ? 4 : Number.isInteger(stored.screen) && stored.screen >= 0 && stored.screen <= 4 ? stored.screen : 0);
      }
    } catch { setError("Je eerdere plan kon niet worden geladen. Je kunt hieronder een plan invullen."); }
    setReady(true);
  }, [initialPlan]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ plan, screen, saved })); }
    catch { setError("Bewaren in deze browser lukt niet. Houd dit scherm open zodat je antwoorden behouden blijven."); }
  }, [plan, screen, saved, ready]);
  function finish() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ plan, screen: 4, saved: true }));
      setSaved(true); setError(""); onFinish(plan);
    } catch { setError("Opslaan is niet gelukt. Probeer opnieuw; je antwoorden staan nog in dit scherm."); }
  }
  if (!ready) return <p role="status">Signaleringsplan laden…</p>;
  const phase = phases[Math.max(0, screen - 1)];

  function update<K extends keyof SignaleringsplanData>(
    phaseKey: K,
    field: keyof SignaleringsplanData[K],
    value: string,
  ) {
    setPlan(current => ({
      ...current,
      [phaseKey]: { ...current[phaseKey], [field]: value },
    }));
  }

  if (screen === 0) {
    return (
      <section style={styles.shell} aria-label="Signaleringsplan">
        <p style={styles.eyebrow}>EXPERT VAN JEZELF</p>
        <h1 style={styles.title}>Mijn signaleringsplan</h1>
        <p style={styles.intro}>
          Je brengt stap voor stap in kaart hoe je merkt dat het goed, minder
          goed of echt slecht met je gaat. Zo weet jij en je omgeving beter wat
          er in elke fase kan helpen.
        </p>
        <div style={styles.infoCard}>
          <strong>We werken met drie fasen</strong>
          <p>Groen: het gaat redelijk stabiel. Oranje: je merkt signalen van oplopende spanning. Rood: je hebt snel extra steun of hulp nodig.</p>
        </div>
        <p style={styles.note}>Je kunt antwoorden later aanpassen. Vul alleen in wat voor jou prettig en haalbaar is.</p>
        {error && <p role="alert">{error}</p>}
        <button type="button" style={styles.primaryButton} onClick={() => setScreen(1)}>Start met de groene fase</button>
        <button type="button" style={styles.secondaryButton} onClick={onBack}>Terug</button>
      </section>
    );
  }

  if (screen === 4) {
    return (
      <section style={styles.shell} aria-label="Samenvatting signaleringsplan">
        <p style={styles.eyebrow}>JOUW PLAN</p>
        <h1 style={styles.title}>Dit is jouw signaleringsplan</h1>
        <p style={styles.intro}>Bekijk of de afspraken herkenbaar zijn. Je kunt ze later opnieuw openen en aanpassen.</p>
        {phases.map(item => (
          <div key={item.key} style={{ ...styles.summaryCard, borderLeftColor: item.color, background: item.background }}>
            <strong>{item.label}</strong>
            <p><b>Signalen:</b> {plan[item.key].signals || "Nog niet ingevuld"}</p>
            <p><b>Wat helpt:</b> {item.key === "green" ? plan.green.helpful : item.key === "orange" ? plan.orange.steps : plan.red.steps || "Nog niet ingevuld"}</p>
            <p><b>Steun/contact:</b> {item.key === "green" ? plan.green.people : item.key === "orange" ? plan.orange.support : plan.red.contacts || "Nog niet ingevuld"}</p>
          </div>
        ))}
        {error && <p role="alert">{error}</p>}
        <button type="button" style={styles.primaryButton} onClick={finish}>{linkedAction ? "Plan opslaan en actie voltooien" : "Plan opslaan en naar Home"}</button>
        <button type="button" style={styles.secondaryButton} onClick={() => setScreen(1)}>Plan aanpassen met invulhulp</button>
        <button type="button" style={styles.secondaryButton} onClick={onBack}>Terug naar Home</button>
      </section>
    );
  }

  const isGreen = phase.key === "green";
  const isOrange = phase.key === "orange";
  return (
    <section style={styles.shell} aria-label={`${phase.label} invullen`}>
      <button type="button" style={styles.backLink} onClick={() => setScreen(screen - 1)}>← Terug</button>
      <p style={styles.note}>Stap {screen} van 3 · Je voortgang wordt in deze browser bewaard.</p>
      {error && <p role="alert">{error}</p>}
      <div style={{ ...styles.phaseBadge, color: phase.color, background: phase.background }}>{phase.label}</div>
      <h1 style={styles.title}>{isGreen ? "Hoe ziet een stabiele periode eruit?" : isOrange ? "Welke signalen vertellen je dat het minder gaat?" : "Wat merk je als het echt niet goed gaat?"}</h1>
      <p style={styles.intro}>
        {isGreen
          ? "Beschrijf hoe je bent wanneer je voldoende balans hebt. Dit helpt om te herkennen wat je wilt behouden."
          : isOrange
            ? "Beschrijf vroege signalen in je gedachten, gevoelens, lichaam of gedrag. Juist dan kun je vaak nog bijsturen."
            : "Beschrijf duidelijke signalen dat je snel extra steun nodig hebt. Maak vooraf concreet wat jij en anderen kunnen doen."}
      </p>
      <label style={styles.label}>Waaraan merk je deze fase? <textarea value={plan[phase.key].signals} onChange={e => update(phase.key, "signals", e.target.value)} placeholder={isGreen ? "Bijvoorbeeld: ik slaap regelmatig en heb contact met anderen…" : "Bijvoorbeeld: ik slaap minder, raak sneller geïrriteerd of trek me terug…"} /></label>
      {isGreen ? (
        <>
          <label style={styles.label}>Wat helpt je om in de groene fase te blijven? <textarea value={plan.green.helpful} onChange={e => update("green", "helpful", e.target.value)} placeholder="Bijvoorbeeld: dagstructuur, wandelen, medicatie, rust…" /></label>
          <label style={styles.label}>Wie of wat wil je hierbij betrekken? <textarea value={plan.green.people} onChange={e => update("green", "people", e.target.value)} placeholder="Bijvoorbeeld: mijn partner, behandelaar of een vaste afspraak…" /></label>
        </>
      ) : isOrange ? (
        <>
          <label style={styles.label}>Wat kun je nu zelf doen? <textarea value={plan.orange.steps} onChange={e => update("orange", "steps", e.target.value)} placeholder="Bijvoorbeeld: prikkels verminderen, rust nemen, iemand bellen…" /></label>
          <label style={styles.label}>Wie kan je helpen en hoe? <textarea value={plan.orange.support} onChange={e => update("orange", "support", e.target.value)} placeholder="Bijvoorbeeld: mijn naaste helpt mij mijn plan te volgen…" /></label>
        </>
      ) : (
        <>
          <label style={styles.label}>Wat moet er direct gebeuren? <textarea value={plan.red.steps} onChange={e => update("red", "steps", e.target.value)} placeholder="Bijvoorbeeld: niet alleen blijven, crisisplan erbij pakken, behandelaar bellen…" /></label>
          <label style={styles.label}>Wie moet je bellen of inschakelen? <textarea value={plan.red.contacts} onChange={e => update("red", "contacts", e.target.value)} placeholder="Noteer namen, telefoonnummers of de afgesproken crisisdienst…" /></label>
        </>
      )}
      <button type="button" style={styles.primaryButton} onClick={() => setScreen(screen + 1)}>{screen === 3 ? "Bekijk mijn plan" : "Verder naar de volgende fase"}</button>
      <button type="button" style={styles.secondaryButton} onClick={onBack}>Later verder invullen</button>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: { maxWidth: 680, margin: "0 auto", padding: "8px 0 28px" },
  eyebrow: { color: "#7168b7", fontSize: 12, fontWeight: 800, letterSpacing: "0.12em" },
  title: { color: "#302b50", fontSize: "clamp(28px, 5vw, 42px)", lineHeight: 1.12, margin: "10px 0 14px" },
  intro: { color: "#5d5675", fontSize: 16, lineHeight: 1.6 },
  note: { color: "#716b89", fontSize: 14, lineHeight: 1.5 },
  infoCard: { borderRadius: 18, background: "#f1effa", padding: "18px 20px", margin: "22px 0", color: "#423d60", lineHeight: 1.5 },
  phaseBadge: { display: "inline-block", borderRadius: 999, padding: "8px 13px", fontSize: 13, fontWeight: 800, margin: "16px 0 4px" },
  summaryCard: { borderLeft: "5px solid", borderRadius: 14, padding: "14px 16px", margin: "12px 0", color: "#433d5e", lineHeight: 1.45 },
  label: { display: "block", color: "#433d5e", fontWeight: 700, margin: "18px 0 0" },
  backLink: { border: 0, background: "transparent", color: "#5b55bd", fontWeight: 800, cursor: "pointer", padding: "4px 0" },
  primaryButton: { display: "block", width: "100%", border: 0, borderRadius: 16, background: "linear-gradient(135deg,#5657df,#7864e8)", color: "white", padding: "15px 18px", marginTop: 22, fontSize: 16, fontWeight: 800, cursor: "pointer" },
  secondaryButton: { display: "block", width: "100%", border: 0, background: "transparent", color: "#5b55bd", padding: "13px 18px", marginTop: 8, fontWeight: 800, cursor: "pointer" },
};
