import { useState } from "react";
import { type ActLanguageVersion, actLanguageVersionLabels } from "./ActModule";
import { type ActionCategory, actionCategoryLabels, actionWasCompletedToday, formatActionSchedule, localDateKey, type RecoveryAction } from "./recoveryModel";
import { recoveryStyles as styles } from "./recoveryStyles";
import type { RecoveryPlan } from "./useRecoveryPlan";

export type ActionCardContext = {
  plan: Pick<RecoveryPlan, "selectedActionId" | "setActiveGoalId" | "setSelectedActionId" | "openActReading" | "openActDailyAction" | "openMindfulnessExercise">;
  onOpenSignaleringsplan: (actionId: number) => void;
  actLanguageVersion: ActLanguageVersion | null;
  openActVersionChoice: () => void;
};

export default function RecoveryActionCard({ action, plan, actLanguageVersion, openActVersionChoice, onOpenSignaleringsplan }: ActionCardContext & { action: RecoveryAction }) {
  const [moduleExpanded, setModuleExpanded] = useState(false);
  const { selectedActionId, setActiveGoalId, setSelectedActionId, openActReading, openActDailyAction, openMindfulnessExercise } = plan;
  if (action.completed) return (
    <div key={action.id} style={styles.completedActionCard}>
      <span style={styles.completedCheck}>✓</span>
      <span style={styles.completedActionBody}>
        <span style={styles.completedActionCategory}>
          <ActionTypeIcon category={action.category} size={16} />

        </span>
        <span style={styles.completedActionText}>
          {action.text}
        </span>
        <span style={styles.actionMetaLine}>
          <span aria-hidden="true">🗓</span>
          {formatActionSchedule(action.schedule)}
        </span>
        {action.support && (
          <span style={styles.actionMetaLine}>
            <span aria-hidden="true">🤝</span>
            {action.support.name}
          </span>
        )}
      </span>
    </div>);
  if ((action.kind === "actModule" || action.kind === "signalingPlan") && !moduleExpanded) {
    return <button type="button" style={{ ...styles.actionCard, padding: "9px 10px", minHeight: 44, borderRadius: 12, gap: 9 }}
      aria-expanded={action.kind === "actModule" ? false : undefined}
      onClick={() => action.kind === "signalingPlan" ? onOpenSignaleringsplan(action.id) : setModuleExpanded(true)}>
      <ActionTypeIcon category={action.category} size={23} />
      <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{action.text}</span>
      <span aria-hidden="true">›</span>
    </button>;
  }
  if (action.kind === "actModule") {
    const moduleProgress = action.actState?.progress ?? 0;

    return (
      <div key={action.id} style={{ ...styles.actModuleCard, padding: 12 }}>
        <button type="button" style={{ ...styles.textButton, minHeight: 44 }} aria-expanded={true} onClick={() => setModuleExpanded(false)}>Details sluiten</button>
        <div style={styles.actModuleHeader}>
          <span style={styles.actionActBadge}>ACT</span>
          <div style={styles.actModuleTitleGroup}>
            <button type="button" style={{ ...styles.actModuleTitle, ...styles.actionTitleButton }} onClick={() => openActReading(action.id)}>{action.text}</button>
            <span style={styles.actModuleSubtitle}>
              Uitleg, video en een herhaalbare oefening
            </span>
            <button
              type="button"
              style={styles.actVersionLink}
              onClick={openActVersionChoice}
            >
              {actLanguageVersion
                ? actLanguageVersionLabels[
                actLanguageVersion
                ]
                : "Kies samen de taalversie"}
              <span aria-hidden="true"> · aanpassen</span>
            </button>
          </div>
        </div>

        <div style={styles.actionMetaStack}>
          <span style={styles.actionMetaLine}>
            <span aria-hidden="true">🗓</span>
            {formatActionSchedule(action.schedule)}
          </span>
          {action.support && (
            <span style={styles.actionMetaLine}>
              <span aria-hidden="true">🤝</span>
              {action.support.name}
              {action.support.how
                ? ` · ${action.support.how}`
                : " ondersteunt bij deze actie"}
            </span>
          )}
        </div>

        <div style={styles.actionProgressBlock}>
          <div style={styles.actionProgressLabelRow}>
            <span>Voortgang module</span>
            <strong>{moduleProgress}%</strong>
          </div>
          <div
            style={styles.actionProgressTrack}
            role="progressbar"
            aria-label="Voortgang van de ACT-module"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={moduleProgress}
          >
            <span
              style={{
                ...styles.actionProgressFill,
                width: `${moduleProgress}%`,
              }}
            />
          </div>
        </div>

        <div style={styles.actModuleButtons}>
          <button
            type="button"
            style={styles.actReadButton}
            onClick={() => openActReading(action.id)}
          >
            Verder lezen
          </button>
          <button
            type="button"
            style={styles.actDailyButton}
            onClick={() => openActDailyAction(action.id)}
          >
            Dagelijkse actie
          </button>
        </div>

        {action.actState?.lastCompletedOn === localDateKey() && (
          <span style={styles.dailyCompletedLabel}>
            ✓ Dagelijkse actie vandaag afgerond
          </span>
        )}
      </div>
    );
  }

  const isSelected = selectedActionId === action.id;

  return (
    <div key={action.id} style={styles.actionItemGroup}>
      <button
        type="button"
        aria-expanded={action.kind === "mindfulness" ? undefined : isSelected}
        aria-controls={action.kind === "mindfulness" ? undefined : `action-details-${action.id}`}
        style={{
          ...styles.actionCard,
          padding: "9px 10px", minHeight: 44, borderRadius: 12, gap: 9,
          ...(isSelected ? styles.selectedActionCard : {}),
        }}
        onClick={() => {
          if (action.kind === "mindfulness" && action.mindfulnessExerciseId) {
            openMindfulnessExercise(action.mindfulnessExerciseId, action.id);
            return;
          }
          setActiveGoalId(action.goalId);
          setSelectedActionId(isSelected ? null : action.id);
        }
        }
      >
        <span title={actionCategoryLabels[action.category]} style={{ flexShrink: 0, display: "inline-flex" }}><ActionTypeIcon category={action.category} size={23} /></span>
        <span style={{ ...styles.actionBody, minWidth: 0, overflowWrap: "anywhere" }}>
          <span style={styles.actionText}>{action.text}</span>
          {isSelected && <span id={`action-details-${action.id}`} style={styles.actionDetails}>
            <span style={styles.actionMetaLine}>
              <span aria-hidden="true">🗓</span>
              {formatActionSchedule(action.schedule)}
            </span>
            {action.support && (
              <span style={styles.actionMetaLine}>
                <span aria-hidden="true">🤝</span>
                {action.support.name}
                {action.support.how
                  ? ` · ${action.support.how}`
                  : " ondersteunt bij deze actie"}
              </span>
            )}
            {action.schedule.repeatMode === "recurring" &&
              actionWasCompletedToday(action) && (
                <span style={styles.recurringCompletedLabel}>
                  ✓ Vandaag afgerond
                </span>
              )}
          </span>}
        </span>
      </button>
      {isSelected && action.resourceUrl && (
        <a
          style={styles.actionResourceLink}
          href={action.resourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open herstelverhalen <span aria-hidden="true">↗</span>
        </a>
      )}
      {isSelected && action.kind === "mindfulness" &&
        action.mindfulnessExerciseId && (
          <button
            type="button"
            style={styles.mindfulnessActionButton}
            onClick={() =>
              openMindfulnessExercise(
                action.mindfulnessExerciseId!,
                action.id,
              )
            }
          >
            Open mindfulnessoefening
            <span aria-hidden="true"> →</span>
          </button>
        )}
    </div>
  );
}

export function ActionTypeIcon({
  category,
  size = 48,
}: {
  category: ActionCategory;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  } as const;

  if (category === "contact") {
    return (
      <svg {...common}>
        <circle cx="18" cy="18" r="6" stroke="currentColor" strokeWidth="3" />
        <circle cx="33" cy="21" r="5" stroke="currentColor" strokeWidth="3" />
        <path d="M7 39c1-8 6-12 12-12s11 4 12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M29 30c6-2 11 2 12 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (category === "practice") {
    return (
      <svg {...common}>
        <path d="M10 29l9 9 20-25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 13h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M10 21h9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="24" cy="25" r="21" fill="#f1eafa" />
      <path d="M7 13c6-2 12-1 17 3v25c-5-4-11-5-17-3V13Z" fill="#fffaf0" stroke="#72609c" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M41 13c-6-2-12-1-17 3v25c5-4 11-5 17-3V13Z" fill="#e2d7f3" stroke="#72609c" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 21c3-.3 5 .3 7 1.5M12 27c3-.3 5 .3 7 1.5M29 23c2-1 4-1.5 7-1.5M29 29c2-1 4-1.5 7-1.5" stroke="#9884b6" strokeWidth="2" strokeLinecap="round" />
      <path d="m35 2 1.6 4.4L41 8l-4.4 1.6L35 14l-1.6-4.4L29 8l4.4-1.6Z" fill="#efb750" />
    </svg>
  );
}
