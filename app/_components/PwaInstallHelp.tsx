"use client";

import { useEffect, useState } from "react";

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isAppleMobile() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function PwaInstallHelp() {
  const [installPrompt, setInstallPrompt] = useState<DeferredInstallPrompt | null>(null);
  const [appleMobile, setAppleMobile] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setAppleMobile(isAppleMobile());
    setInstalled(isStandalone());
    const onBeforeInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as DeferredInstallPrompt); };
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return <p style={copyStyle}>RecoveryBuddy staat als app op je beginscherm.</p>;

  return (
    <section aria-label="RecoveryBuddy installeren" style={boxStyle}>
      <h2 style={titleStyle}>Zet RecoveryBuddy op je beginscherm</h2>
      {appleMobile ? (
        <p style={copyStyle}>Open deze pagina in Safari. Tik op Deel, kies <strong>Zet op beginscherm</strong> en bevestig. Daarna opent RecoveryBuddy als eigen app.</p>
      ) : installPrompt ? (
        <>
          <p style={copyStyle}>Installeer RecoveryBuddy op dit apparaat, zodat je de app snel kunt openen.</p>
          <button type="button" style={buttonStyle} onClick={() => void installPrompt.prompt()}>Installeer RecoveryBuddy</button>
        </>
      ) : (
        <p style={copyStyle}>Gebruik in je browser het menu met <strong>Installeren</strong> of <strong>Toevoegen aan beginscherm</strong>.</p>
      )}
    </section>
  );
}

const boxStyle = { borderRadius: "18px", padding: "15px", background: "#f2efff", border: "1px solid #ded8f5", marginBottom: "16px" };
const titleStyle = { margin: "0 0 6px", color: "#40395f", fontSize: "16px" };
const copyStyle = { margin: 0, color: "#645d78", fontSize: "13px", lineHeight: 1.5 };
const buttonStyle = { minHeight: "44px", marginTop: "12px", padding: "10px 14px", border: 0, borderRadius: "12px", background: "#625bdd", color: "white", fontWeight: 800, cursor: "pointer" };
