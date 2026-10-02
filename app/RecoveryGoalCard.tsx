import RecoveryActionCard, { type ActionCardContext } from "./RecoveryActionCard";
import { actionWasCompletedToday, type RecoveryGoal } from "./recoveryModel";
import { recoveryStyles as styles } from "./recoveryStyles";
import type { RecoveryPlan } from "./useRecoveryPlan";

type Props = Omit<ActionCardContext, "plan"> & {
  plan: Pick<RecoveryPlan, "selectedActionId" | "setActiveGoalId" | "setSelectedActionId" | "openActReading" | "openActDailyAction" | "openMindfulnessExercise" | "actions" | "selectedAction" | "editGoal" | "openActionCreator" | "completeSelectedAction">;
  recoveryGoal: RecoveryGoal;
  goalIndex: number;
  onOpenSignaleringsplan: (actionId: number) => void;
};

export default function RecoveryGoalCard({ recoveryGoal, plan, actLanguageVersion, openActVersionChoice, onOpenSignaleringsplan }: Props) {
  const { actions, selectedAction, editGoal, openActionCreator, completeSelectedAction } = plan;
  const openActions = actions.filter(action => action.goalId === recoveryGoal.id && !action.completed);
  return (
    <section aria-label={`Hersteldoel: ${recoveryGoal.text}`} style={{ ...styles.goalCard, padding: 12, borderRadius: 16, margin: "0 0 10px", boxShadow: "none" }}>
      <div style={styles.goalTitleRow}>
        <h2 style={{ ...styles.goalName, fontSize: 21 }}>Veranderwens: {recoveryGoal.text}</h2>
        <button type="button" style={{ ...styles.editGoalButton, width: 44, height: 44 }} aria-label={`Hersteldoel aanpassen: ${recoveryGoal.text}`} title="Doel aanpassen" onClick={() => editGoal(recoveryGoal.id)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m16 3 5 5-12 12-6 1 1-6Z" /><path d="m14 5 5 5" /></svg>
        </button>
      </div>
      <div style={{ ...styles.nestedActions, marginTop: 6, paddingLeft: 9 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: "#736982" }}>Acties</h3>
        {openActions.length === 0 ? (
          <div style={{ color: "#736982", fontSize: 13, padding: "6px 0" }}>
            Je hebt op dit moment geen openstaande acties.
          </div>
        ) : (
          <div style={{ ...styles.actionList, gap: 6 }}>
            {openActions.map(action => (<RecoveryActionCard key={action.id} action={action} plan={plan} actLanguageVersion={actLanguageVersion} openActVersionChoice={openActVersionChoice} onOpenSignaleringsplan={onOpenSignaleringsplan} />))}
          </div>
        )}

        {selectedAction && !selectedAction.completed && selectedAction.goalId === recoveryGoal.id && selectedAction.kind !== "actModule" && (
          <div style={styles.completeArea}>
            <p style={styles.helperText}>
              Heb je deze actie uitgevoerd? Markeer hem dan als voltooid.
            </p>
            <button
              type="button"
              style={{
                ...styles.completeButton,
                ...(selectedAction.schedule.repeatMode === "recurring" &&
                  actionWasCompletedToday(selectedAction)
                  ? styles.disabledButton
                  : {}),
              }}
              disabled={
                selectedAction.schedule.repeatMode === "recurring" &&
                actionWasCompletedToday(selectedAction)
              }
              onClick={completeSelectedAction}
            >
              {selectedAction.schedule.repeatMode === "recurring"
                ? actionWasCompletedToday(selectedAction)
                  ? "✓ Deze herhaling is vandaag afgerond"
                  : "✓ Herhaling van vandaag afronden"
                : "✓ Geselecteerde actie voltooien"}
            </button>
          </div>
        )}

        <button type="button" style={{ ...styles.addActionButton, marginTop: 6, padding: "9px 12px", minHeight: 44 }} onClick={() => openActionCreator(recoveryGoal.id)}>+ Actie toevoegen</button>



      </div>
    </section>
  );
}
