"use client";

import { useEffect, useState } from "react";

type Preference = { enabled: boolean; time: string; timeZone: string };
type Config = { pushConfigured: boolean; publicKey?: string };
type Permission = NotificationPermission | "unsupported";

const defaultPreference: Preference = { enabled: false, time: "09:00", timeZone: "Europe/Amsterdam" };

function applicationServerKey(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const decoded = atob(padded);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

function installedPwa() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function NotificationSettings() {
  const [preference, setPreference] = useState<Preference>(defaultPreference);
  const [config, setConfig] = useState<Config | null>(null);
  const [permission, setPermission] = useState<Permission>("default");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) setPermission("unsupported");
    else setPermission(Notification.permission);
    void Promise.all([
      fetch("/api/notifications/preferences", { cache: "no-store" }).then((response) => response.ok ? response.json() as Promise<{ preference: Preference }> : null),
      fetch("/api/notifications/config", { cache: "no-store" }).then((response) => response.json() as Promise<Config>),
    ]).then(([settings, pushConfig]) => {
      if (settings?.preference) setPreference(settings.preference);
      setConfig(pushConfig);
    }).catch(() => setMessage("De instellingen konden niet van de server worden geladen."));
  }, []);

  async function save(next: Preference) {
    const response = await fetch("/api/notifications/preferences", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next),
    });
    if (!response.ok) throw new Error("SAVE_FAILED");
    setPreference(next);
  }

  async function disable() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/notifications/subscription", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint }) });
        await subscription.unsubscribe();
      }
      await save({ ...preference, enabled: false });
      setMessage("Herinneringen staan uit. Je pushabonnement is verwijderd.");
    } catch { setMessage("Het uitzetten lukte niet. Probeer het opnieuw."); }
    finally { setBusy(false); }
  }

  async function enable() {
    if (!config?.pushConfigured || !config.publicKey) {
      setMessage("Pushmeldingen zijn nog niet op deze server ingesteld.");
      return;
    }
    if (permission === "unsupported") {
      setMessage("Dit apparaat ondersteunt geen pushmeldingen voor deze webapp.");
      return;
    }
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && !installedPwa()) {
      setMessage("Zet RecoveryBuddy eerst op je beginscherm. iPhone ondersteunt webpush alleen voor geïnstalleerde webapps.");
      return;
    }
    setBusy(true);
    try {
      const nextPermission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      setPermission(nextPermission);
      if (nextPermission !== "granted") {
        setMessage(nextPermission === "denied" ? "Meldingen zijn geblokkeerd in de apparaat- of browserinstellingen." : "Er is nog geen toestemming voor meldingen gegeven.");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription() ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey(config.publicKey),
      });
      const response = await fetch("/api/notifications/subscription", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription),
      });
      if (!response.ok) throw new Error("SUBSCRIBE_FAILED");
      await save({ ...preference, enabled: true });
      setMessage(`Dagelijkse herinnering ingesteld voor ${preference.time}.`);
    } catch { setMessage("De pushmelding kon niet worden ingesteld. Probeer het opnieuw."); }
    finally { setBusy(false); }
  }

  async function updateTime(time: string) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return;
    const next = { ...preference, time };
    setPreference(next);
    try { await save(next); if (next.enabled) setMessage(`Dagelijkse herinnering verplaatst naar ${time}.`); }
    catch { setMessage("Het nieuwe tijdstip kon niet worden opgeslagen."); }
  }

  async function sendTest() {
    setBusy(true);
    try {
      const response = await fetch("/api/notifications/test", { method: "POST" });
      const body = await response.json().catch(() => null) as { delivered?: number } | null;
      setMessage(response.ok && body?.delivered ? "Testmelding verstuurd. Controleer je meldingencentrum." : "De testmelding kon niet worden afgeleverd.");
    } catch { setMessage("De testmelding kon niet worden verstuurd."); }
    finally { setBusy(false); }
  }

  const permissionText = permission === "granted" ? "Meldingen toegestaan" : permission === "denied" ? "Geblokkeerd door het apparaat" : permission === "unsupported" ? "Niet ondersteund" : "Nog geen toestemming gevraagd";
  return (
    <section style={cardStyle} aria-labelledby="notification-settings-heading">
      <h2 id="notification-settings-heading" style={titleStyle}>Dagelijkse herinnering</h2>
      <p style={copyStyle}>Kies zelf een tijdstip voor een algemene herstelherinnering. De melding bevat geen doelen, symptomen of andere persoonlijke informatie.</p>
      <div style={rowStyle}>
        <div><strong>Dagelijkse melding</strong><span style={smallStyle}>{permissionText}</span></div>
        <button type="button" role="switch" aria-checked={preference.enabled} disabled={busy} style={switchStyle} onClick={() => void (preference.enabled ? disable() : enable())}>{preference.enabled ? "Aan" : "Uit"}</button>
      </div>
      <label htmlFor="server-reminder-time" style={labelStyle}>Tijdstip</label>
      <input id="server-reminder-time" type="time" value={preference.time} disabled={busy} style={inputStyle} onChange={(event) => void updateTime(event.target.value)} />
      <p style={smallStyle}>Tijdzone: {preference.timeZone}. Je instelling wordt veilig bij je account bewaard.</p>
      <button type="button" disabled={busy || !preference.enabled} style={testStyle} onClick={() => void sendTest()}>Stuur een testmelding</button>
      {message && <p role="status" style={statusStyle}>{message}</p>}
    </section>
  );
}

const cardStyle = { border: "1px solid #e2dcf3", borderRadius: "24px", backgroundColor: "rgba(255, 255, 255, 0.9)", padding: "18px", marginBottom: "16px", boxShadow: "0 9px 24px rgba(69, 59, 120, 0.07)" };
const titleStyle = { color: "#342f54", fontSize: "18px", lineHeight: 1.3, margin: "1px 0 5px" };
const copyStyle = { color: "#79728d", fontSize: "13px", lineHeight: 1.45, margin: "0 0 14px" };
const rowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", borderTop: "1px solid #eeeaf5", borderBottom: "1px solid #eeeaf5", padding: "14px 0", color: "#403a5d", fontSize: "14px" };
const smallStyle = { display: "block", color: "#888197", fontSize: "12px", lineHeight: 1.45, marginTop: "3px" };
const switchStyle = { minWidth: "54px", minHeight: "42px", border: 0, borderRadius: "999px", background: "#625bdd", color: "white", fontWeight: 800, cursor: "pointer" };
const labelStyle = { display: "block", color: "#4b4569", fontSize: "13px", fontWeight: 800, margin: "17px 0 7px" };
const inputStyle = { width: "100%", minHeight: "44px", border: "1.5px solid #d9d3eb", borderRadius: "15px", backgroundColor: "#ffffff", padding: "9px 12px", color: "#403a5d" };
const testStyle = { minHeight: "44px", width: "100%", border: 0, borderRadius: "14px", background: "#625bdd", color: "white", fontWeight: 800, marginTop: "15px", cursor: "pointer" };
const statusStyle = { borderRadius: "13px", background: "#eef9f4", color: "#34725f", fontSize: "12px", lineHeight: 1.45, padding: "10px 12px", margin: "12px 0 0" };
