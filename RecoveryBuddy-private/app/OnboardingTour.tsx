"use client";

import type { CSSProperties } from "react";

export const TOUR_STAGES = [
  "home",
  "buddy",
  "goals",
  "actions",
  "information",
  "practice",
  "contact",
] as const;

export type TourStage = (typeof TOUR_STAGES)[number];

type OnboardingTourProps = {
  stage: TourStage;
  onBack: () => void;
  onNext: () => void;
};

const tourContent: Record<
  TourStage,
  { step: string; title: string; text: string; nextLabel: string }
> = {
  home: {
    step: "1 VAN 7",
    title: "Dit is je homepagina",
    text: "Hier zie je in één overzicht waar je mee bezig bent. Je kunt deze pagina altijd terugvinden via het uitvergrote huisicoontje onderaan het scherm.",
    nextLabel: "Laat de herstelbuddy zien",
  },
  buddy: {
    step: "2 VAN 7",
    title: "Hier vind je mij",
    text: "Ik ben je herstelbuddy. Je kunt altijd bij me inchecken en met vijf smileys aangeven hoe je je voelt. Daarna geef ik je een overzicht van mogelijke acties.",
    nextLabel: "Laat de hersteldoelen zien",
  },
  goals: {
    step: "3 VAN 7",
    title: "Dit zijn jouw hersteldoelen",
    text: "Je kunt persoonlijke doelen aanmaken om richting te geven aan jouw herstel. Na de volledige rondleiding gaan we samen je eerste doel invullen.",
    nextLabel: "Laat de soorten acties zien",
  },
  actions: {
    step: "4 VAN 7",
    title: "Drie soorten acties",
    text: "Bij een hersteldoel kun je kiezen uit Contact, Oefenen en Leren. Iedere actie kan eenmalig of herhaald worden gepland en aan een ondersteuner worden gekoppeld.",
    nextLabel: "Laat Informatie zien",
  },
  information: {
    step: "5 VAN 7",
    title: "Informatie",
    text: "Hier vind je informatie die jouw herstel kan ondersteunen, zoals persoonlijke herstelverhalen van anderen.",
    nextLabel: "Laat Oefenen zien",
  },
  practice: {
    step: "6 VAN 7",
    title: "Oefenen",
    text: "Hier kun je oefenen met kleine stappen, jouw dagelijkse actie uitvoeren of verdergaan met een ACT-oefening.",
    nextLabel: "Laat Contact zien",
  },
  contact: {
    step: "7 VAN 7",
    title: "Contact",
    text: "Hier vind je de mensen die jou kunnen ondersteunen en kun je vastleggen wie je bij een actie wilt betrekken.",
    nextLabel: "Rondleiding afronden",
  },
};

export default function OnboardingTour({
  stage,
  onBack,
  onNext,
}: OnboardingTourProps) {
  const content = tourContent[stage];
  const isResourceStage =
    stage === "information" || stage === "practice" || stage === "contact";

  return (
    <div style={styles.layer} aria-live="polite">
      <div style={styles.backdrop} aria-hidden="true" />

      {stage === "goals" && (
        <div style={styles.goalPreview} aria-hidden="true">
          <span style={styles.goalLabel}>Wat zou ik willen veranderen?</span>
          <p style={styles.goalEmptyText}>
            Je hebt nog geen hersteldoel toegevoegd.
          </p>
          <span style={styles.goalButton}>Doel toevoegen</span>
        </div>
      )}

      {isResourceStage && (
        <div style={styles.resourcePreview} aria-hidden="true">
          {(
            [
              { key: "information", icon: "i", label: "Informatie" },
              { key: "practice", icon: "✓", label: "Oefenen" },
              { key: "contact", icon: "•••", label: "Contact" },
            ] as const
          ).map((resource) => {
            const isHighlighted = stage === resource.key;

            return (
              <span
                key={resource.key}
                style={{
                  ...styles.resourceItem,
                  ...(isHighlighted ? styles.highlightedResourceItem : {}),
                }}
              >
                <span style={styles.resourceIcon}>{resource.icon}</span>
                <strong>{resource.label}</strong>
              </span>
            );
          })}
        </div>
      )}

      {stage === "actions" && (
        <div style={styles.actionTypesPreview} aria-hidden="true">
          {[
            { icon: "♧", label: "Contact" },
            { icon: "✓", label: "Oefenen" },
            { icon: "▤", label: "Leren" },
          ].map((actionType) => (
            <span key={actionType.label} style={styles.actionTypePreviewItem}>
              <span style={styles.actionTypePreviewIcon}>{actionType.icon}</span>
              <strong>{actionType.label}</strong>
            </span>
          ))}
        </div>
      )}

      <section
        style={{
          ...styles.coachmark,
          ...(stage === "home" ? styles.homeCoachmark : {}),
          ...(stage === "buddy" ? styles.buddyCoachmark : {}),
          ...(stage === "goals" ? styles.goalsCoachmark : {}),
          ...(stage === "actions" ? styles.actionsCoachmark : {}),
          ...(isResourceStage ? styles.resourceCoachmark : {}),
        }}
        role="dialog"
        aria-label={`Rondleiding: ${content.title}`}
      >
        <div style={styles.coachHeader}>
          <TourAvatar />
          <span style={styles.stepLabel}>RONDLEIDING · {content.step}</span>
        </div>

        <h2 style={styles.title}>{content.title}</h2>
        <p style={styles.text}>{content.text}</p>

        <div style={styles.actions}>
          <button type="button" style={styles.backButton} onClick={onBack}>
            Terug
          </button>
          <button type="button" style={styles.nextButton} onClick={onNext}>
            {content.nextLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function TourAvatar() {
  return (
    <span style={styles.avatar} aria-hidden="true">
      <span style={{ ...styles.eye, left: "28%" }} />
      <span style={{ ...styles.eye, right: "28%" }} />
      <span style={styles.smile} />
    </span>
  );
}

const styles: Record<string, CSSProperties> = {
  layer: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    pointerEvents: "none",
    fontFamily: '"Segoe UI", "Avenir Next", Arial, sans-serif',
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(39, 31, 71, 0.48)",
    backdropFilter: "blur(1.5px)",
    pointerEvents: "auto",
  },
  goalPreview: {
    position: "fixed",
    top: "142px",
    right: "max(20px, calc((100vw - 460px) / 2 + 20px))",
    zIndex: 70,
    width: "min(404px, calc(100vw - 40px))",
    boxSizing: "border-box",
    border: "1px solid rgba(174, 148, 226, 0.35)",
    borderRadius: "24px",
    background: "linear-gradient(145deg, #fff0f5, #f0ecff)",
    padding: "20px",
    transform: "scale(1.04)",
    boxShadow:
      "0 0 0 6px rgba(255, 255, 255, 0.94), 0 22px 55px rgba(47, 34, 91, 0.38)",
    pointerEvents: "none",
  },
  goalLabel: {
    display: "block",
    marginBottom: "7px",
    color: "#6961a9",
    fontSize: "13px",
    fontWeight: 800,
  },
  goalEmptyText: {
    margin: "0 0 13px",
    color: "#85809b",
    fontSize: "15px",
    lineHeight: 1.5,
  },
  goalButton: {
    display: "inline-block",
    borderRadius: "999px",
    backgroundColor: "#e9e5ff",
    color: "#544db2",
    fontSize: "13px",
    fontWeight: 800,
    padding: "10px 14px",
  },
  resourcePreview: {
    position: "fixed",
    right: "max(18px, calc((100vw - 460px) / 2 + 18px))",
    bottom: "103px",
    zIndex: 70,
    width: "min(424px, calc(100vw - 36px))",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "8px",
    boxSizing: "border-box",
    borderRadius: "23px",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    padding: "12px",
    boxShadow:
      "0 0 0 5px rgba(255, 255, 255, 0.82), 0 20px 50px rgba(42, 31, 83, 0.36)",
    pointerEvents: "none",
  },
  actionTypesPreview: {
    position: "fixed",
    top: "148px",
    right: "max(20px, calc((100vw - 460px) / 2 + 20px))",
    zIndex: 70,
    width: "min(404px, calc(100vw - 40px))",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "9px",
    boxSizing: "border-box",
    borderRadius: "24px",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    padding: "14px",
    boxShadow:
      "0 0 0 6px rgba(255, 255, 255, 0.88), 0 22px 55px rgba(47, 34, 91, 0.38)",
    pointerEvents: "none",
  },
  actionTypePreviewItem: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    borderRadius: "17px",
    background: "linear-gradient(145deg, #fff0f5, #f0ecff)",
    color: "#4d476d",
    fontSize: "12px",
    padding: "13px 6px",
  },
  actionTypePreviewIcon: {
    width: "35px",
    height: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    background: "linear-gradient(145deg, #6260df, #ff8fa8)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 900,
  },
  resourceItem: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
    borderRadius: "16px",
    backgroundColor: "#f1eff9",
    color: "#68627e",
    fontSize: "11px",
    padding: "11px 5px",
    transition: "transform 200ms ease",
  },
  highlightedResourceItem: {
    zIndex: 2,
    transform: "scale(1.18)",
    background: "linear-gradient(145deg, #fff0f5, #ece9ff)",
    color: "#514ab2",
    boxShadow: "0 10px 24px rgba(84, 73, 170, 0.28)",
  },
  resourceIcon: {
    width: "31px",
    height: "31px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "11px",
    background: "linear-gradient(145deg, #6260df, #8b70ed)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 900,
  },
  coachmark: {
    position: "fixed",
    right: "max(16px, calc((100vw - 460px) / 2 + 16px))",
    zIndex: 80,
    width: "min(392px, calc(100vw - 32px))",
    boxSizing: "border-box",
    border: "1px solid rgba(176, 158, 232, 0.42)",
    borderRadius: "26px",
    background: "linear-gradient(145deg, #ffffff, #fff6fa)",
    boxShadow: "0 24px 70px rgba(37, 28, 77, 0.35)",
    padding: "19px",
    pointerEvents: "auto",
  },
  homeCoachmark: {
    bottom: "182px",
  },
  buddyCoachmark: {
    bottom: "190px",
  },
  goalsCoachmark: {
    bottom: "122px",
  },
  actionsCoachmark: {
    bottom: "126px",
  },
  resourceCoachmark: {
    bottom: "266px",
  },
  coachHeader: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginBottom: "11px",
  },
  stepLabel: {
    color: "#665cba",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.9px",
  },
  title: {
    margin: "0 0 8px",
    color: "#302a51",
    fontSize: "21px",
    lineHeight: 1.25,
  },
  text: {
    margin: 0,
    color: "#625d78",
    fontSize: "14px",
    lineHeight: 1.55,
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: "8px",
    marginTop: "17px",
  },
  backButton: {
    border: 0,
    borderRadius: "14px",
    backgroundColor: "#efedf8",
    color: "#67617f",
    fontSize: "13px",
    fontWeight: 800,
    padding: "12px 14px",
    cursor: "pointer",
  },
  nextButton: {
    border: 0,
    borderRadius: "14px",
    background: "linear-gradient(135deg, #5859df, #7b63e8)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 900,
    padding: "12px 14px",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(82, 78, 205, 0.23)",
  },
  avatar: {
    position: "relative",
    display: "inline-block",
    width: "34px",
    height: "34px",
    flexShrink: 0,
    borderRadius: "46% 54% 50% 50% / 52% 44% 56% 48%",
    background: "linear-gradient(145deg, #ff799e, #ff9f93)",
    boxShadow: "0 6px 14px rgba(237, 103, 144, 0.24)",
  },
  eye: {
    position: "absolute",
    top: "37%",
    width: "8%",
    height: "11%",
    minWidth: "3px",
    minHeight: "4px",
    borderRadius: "50%",
    backgroundColor: "#39304d",
  },
  smile: {
    position: "absolute",
    left: "50%",
    top: "49%",
    width: "29%",
    height: "15%",
    transform: "translateX(-50%)",
    borderBottom: "2.5px solid #39304d",
    borderRadius: "0 0 999px 999px",
  },
};
