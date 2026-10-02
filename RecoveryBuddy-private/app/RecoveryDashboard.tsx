import { useState } from "react";
import { type ActLanguageVersion } from "./ActModule";
import type { FlowEventType, StepId } from "./userFlow";
import RecoveryActionCard, { ActionTypeIcon } from "./RecoveryActionCard";
import RecoveryGoalCard from "./RecoveryGoalCard";
import { actionCategoryLabels, contactActionOptions, learningActionOptions, practiceActionOptions, type ActionCategory } from "./recoveryModel";
import { recoveryStyles as styles } from "./recoveryStyles";
import type { RecoveryPlan } from "./useRecoveryPlan";

type Props = {
  plan: RecoveryPlan;
  step: StepId;
  navigate: (event: FlowEventType) => void;
  actLanguageVersion: ActLanguageVersion | null;
  openActVersionChoice: () => void;
  restartOnboarding: () => void;
  onOpenLearning: () => void;
  onOpenCoping: () => void;
  onOpenSignaleringsplan: (actionId: number) => void;
};

// De hoofdindeling van Home. Doel- en actiekaarten hebben hun eigen component.
export default function RecoveryDashboard({ plan, step, navigate, actLanguageVersion, openActVersionChoice, restartOnboarding, onOpenLearning, onOpenCoping, onOpenSignaleringsplan }: Props) {
  const { goals, startNewGoal, startActionTemplate } = plan;
  const [resourceCategory, setResourceCategory] = useState<ActionCategory | null>(null);
  const resourceOptions = resourceCategory === "practice" ? practiceActionOptions : resourceCategory === "learn" ? learningActionOptions : contactActionOptions;
  return (
    <div style={{ paddingTop: "calc(88px + env(safe-area-inset-top, 0px))" }}>
      <p role="status" style={{ margin: "0 0 10px", color: plan.syncStatus === "error" ? "#9b2c2c" : "#625778", fontSize: 12, lineHeight: 1.4 }}>
        {plan.syncStatus === "saved" ? "Je voortgang is opgeslagen in je herstelomgeving." : plan.syncStatus === "saving" ? "Je voortgang wordt opgeslagen…" : plan.syncStatus === "error" ? "Je voortgang kon niet worden opgeslagen. Controleer je verbinding en probeer het opnieuw." : "Je herstelplan wordt geladen…"}
      </p>
      <section aria-labelledby="recovery-plan-heading" style={{ border: "1px solid #e4ddef", borderRadius: "20px", padding: "16px", background: "rgba(255,255,255,0.55)" }}>
      <h1 id="recovery-plan-heading" style={{ ...styles.title, fontSize: 24, margin: "0 0 14px" }}>
        <button type="button" onClick={() => navigate("OPEN_RECOVERY_PLAN")} aria-label="Mijn herstelplan aanpassen" title="Mijn herstelplan aanpassen"
          style={{ display: "inline-flex", alignItems: "center", gap: 10, minHeight: 44, padding: 0, border: 0, background: "transparent", color: "inherit", font: "inherit", textAlign: "left", cursor: "pointer" }}>
          <span>Mijn herstelplan</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, color: "#6253a0" }}><path d="m16 3 5 5-12 12-6 1 1-6Z" /><path d="m14 5 5 5" /></svg>
        </button>
      </h1>
      {goals.length === 0 && (
        <div style={styles.emptyCard}>
          Begin met een hersteldoel. Daarna kun je er acties aan toevoegen.
        </div>
      )}
      {goals.map((recoveryGoal, goalIndex) => (
        <RecoveryGoalCard key={recoveryGoal.id} recoveryGoal={recoveryGoal} goalIndex={goalIndex} plan={plan} actLanguageVersion={actLanguageVersion} openActVersionChoice={openActVersionChoice} onOpenSignaleringsplan={onOpenSignaleringsplan} />
      ))}
      <button type="button" style={{ ...styles.newGoalButton, marginBottom: 0 }} onClick={startNewGoal}>+ Nieuw hersteldoel</button>
      <div style={{ marginTop: 8 }}>
        {goals.map(recoveryGoal => {
          const completed = plan.actions.filter(action => action.goalId === recoveryGoal.id && action.completed);
          return (
            <details key={recoveryGoal.id} style={{ borderBottom: "1px solid #e8e1ef" }}>
              <summary style={{ padding: "10px 2px", minHeight: 44, boxSizing: "border-box", color: "#625778", fontSize: 13, cursor: "pointer", overflowWrap: "anywhere" }}>
                Afgeronde acties ({completed.length}) · {recoveryGoal.text}
              </summary>
              <div style={{ ...styles.actionList, gap: 6, paddingBottom: 8 }}>
                {completed.length === 0 && <p style={{ ...styles.emptyCompletedText, margin: "4px 0" }}>Nog geen afgeronde acties.</p>}
                {completed.map(action => <RecoveryActionCard key={action.id} action={action} plan={plan} actLanguageVersion={actLanguageVersion} openActVersionChoice={openActVersionChoice} onOpenSignaleringsplan={onOpenSignaleringsplan} />)}
              </div>
            </details>
          );
        })}
      </div>
      </section>

      <section style={styles.resourcesSection}>
        <h2 style={styles.sectionTitle}>Middelen voor mijn herstel</h2>
        <div style={styles.resourcesGrid}>
          {(["learn", "practice", "contact"] as const).map(category => (
            <button key={category} type="button" style={{ ...styles.resourceCard, ...(resourceCategory === category ? styles.selectedResourceCard : {}) }}
              aria-expanded={category === "learn" ? undefined : resourceCategory === category} aria-controls={category === "learn" ? undefined : "home-resource-options"}
              onClick={() => category === "learn" ? onOpenLearning() : setResourceCategory(current => current === category ? null : category)}>
              <ActionTypeIcon category={category} size={30} />
              <strong style={styles.resourceTitle}>{actionCategoryLabels[category]}</strong>
            </button>
          ))}
        </div>
        {resourceCategory && (
          <section id="home-resource-options" aria-label={`Mogelijke acties voor ${actionCategoryLabels[resourceCategory]}`} style={styles.resourceOptions}>
            <h3 style={styles.sectionTitle}>{actionCategoryLabels[resourceCategory]} — kies een actie</h3>
            <p style={styles.helperText}>Kies een sjabloon. Daarna bepaal je het hersteldoel, de planning en eventuele ondersteuning.</p>
            <div style={styles.actionList}>
              {resourceOptions.map(option => (
                <button key={option.value} type="button" style={styles.templateButton} onClick={() => startActionTemplate(resourceCategory, option.value)}>
                  {option.label}<span aria-hidden="true"> →</span>
                </button>
              ))}
            </div>
            {resourceCategory === "learn" && (
              <div style={styles.learningLinks}>
                <button type="button" style={styles.textButton} onClick={onOpenLearning}>Zoeken in de psychoeducatiebibliotheek</button>
                <button type="button" style={styles.textButton} onClick={onOpenCoping}>Coping toen en nu lezen</button>
              </div>
            )}
          </section>
        )}
      </section>

      {step === "dashboard" && (
        <button
          type="button"
          style={styles.restartOnboardingButton}
          onClick={restartOnboarding}
        >
          Rondleiding en ACT-keuze opnieuw bekijken
        </button>
      )}
    </div>
  );
}
