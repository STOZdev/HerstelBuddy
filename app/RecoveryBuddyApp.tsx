"use client";

import { readPreference, writePreference } from "./browserSupport";

import { emitFlowStepViewed, FLOW_STEP_META, isDashboardTourStep, USER_FLOW_VERSION, type FlowEventType } from "./userFlow";
import { navigationReducer } from "./navigationReducer";
import { ActionTypeIcon } from "./RecoveryActionCard";
import RecoveryDashboard from "./RecoveryDashboard";
import { actionCategoryLabels, formatActionSchedule, learningActionOptions, practiceActionOptions, weekdayOptions, type ActionFrequency } from "./recoveryModel";
import { useRecoveryPlan } from "./useRecoveryPlan";
import { searchPsychoeducation, type PsychoRecord } from "./psychoeducation";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import ActModule, {
  actLanguageVersionOptions,
  actProgressByStage,
  type ActLanguageVersion
} from "./ActModule";
import MindfulnessModule, {
  mindfulnessExercises
} from "./MindfulnessModule";
import ExposureModule from "./ExposureModule";
import SignaleringsplanModule, { type SignaleringsplanData } from "./SignaleringsplanModule";
import OnboardingTour from "./OnboardingTour";
import PsychoeducationLibrary, { type PsychoeducationHandle } from "./PsychoeducationLibrary";
import RecoveryBuddy from "./RecoveryBuddy";
import RecoveryPlanModule from "./RecoveryPlanModule";
import NotificationSettings from "./_components/NotificationSettings";
import PwaInstallHelp from "./_components/PwaInstallHelp";

const MODULE_LANGUAGE_STORAGE_KEY = "umcu-recovery-module-language";

const confettiPieces = [
  { left: "8%", color: "#ff6b6b", delay: "0s", rotate: "12deg" },
  { left: "16%", color: "#ffd166", delay: "0.15s", rotate: "45deg" },
  { left: "25%", color: "#06d6a0", delay: "0.05s", rotate: "82deg" },
  { left: "34%", color: "#118ab2", delay: "0.25s", rotate: "120deg" },
  { left: "43%", color: "#ef476f", delay: "0.1s", rotate: "160deg" },
  { left: "52%", color: "#7b61ff", delay: "0.3s", rotate: "205deg" },
  { left: "61%", color: "#ffd166", delay: "0.18s", rotate: "245deg" },
  { left: "70%", color: "#06d6a0", delay: "0.02s", rotate: "280deg" },
  { left: "79%", color: "#118ab2", delay: "0.22s", rotate: "320deg" },
  { left: "88%", color: "#ff6b6b", delay: "0.12s", rotate: "350deg" },
];

function AssistantAvatar({ size = 44 }: { size?: number }) {
  return (
    <div
      style={{ ...styles.avatar, width: size, height: size }}
      aria-hidden="true"
    >
      <span style={{ ...styles.avatarEye, left: "28%" }} />
      <span style={{ ...styles.avatarEye, right: "28%" }} />
      <span style={styles.avatarSmile} />
    </div>
  );
}

export default function Home() {
  const psychoeducationRef = useRef<PsychoeducationHandle>(null);
  const [pendingPsychoeducation, setPendingPsychoeducation] = useState<string | null>(null);
  const [actionPsychoQuery, setActionPsychoQuery] = useState("");
  const [actionPsychoItems, setActionPsychoItems] = useState<PsychoRecord[]>([]);
  const [learningOrigin, setLearningOrigin] = useState<"dashboard" | "actionsSpecify">("dashboard");
  const [nowActionId, setNowActionId] = useState<number | null>(null);
  const [step, dispatchFlow] = useReducer(navigationReducer, "welcome");
  const [hasFinishedOnboarding, setHasFinishedOnboarding] = useState(false);
  const navigate = useCallback((event: FlowEventType) => {
    // De actie is al opgeslagen door useRecoveryPlan. Sla het oude
    // samenvattingsscherm over en rond ook de eerste onboarding af.
    if (
      event === "ACTION_SUPPORT_NO" ||
      event === "ACTION_SUPPORT_DETAILS_SAVE" ||
      event === "ACTIONS_CONTINUE"
    ) {
      setHasFinishedOnboarding(true);
      dispatchFlow({ type: "GO_HOME" });
      return;
    }
    dispatchFlow({ type: event });
  }, []);
  const handlePlanSaved = useCallback(() => setHasFinishedOnboarding(true), []);
  const plan = useRecoveryPlan(navigate, handlePlanSaved);
  const { chooseTemplateGoal, startTemplateGoal } = plan;
  const {
    goals,
    activeGoalId,
    goalDraft,
    setGoalDraft,
    goalPickerPurpose,
    actions,
    newAction,
    setNewAction,
    selectedActionCategory,
    selectedActionTemplate,
    setSelectedActionTemplate,
    actionRepeatMode,
    setActionRepeatMode,
    actionFrequency,
    setActionFrequency,
    actionDate,
    setActionDate,
    actionTime,
    setActionTime,
    actionWeekday,
    setActionWeekday,
    actionTiming,
    setActionTiming,
    selectedActionId,
    setSelectedActionId,
    draftSupporter,
    setDraftSupporter,
    draftSupportHow,
    setDraftSupportHow,
    showCelebration,
    celebrationTitle,
    celebrationText,
    actStage,
    setActStage,
    actActionId,
    actBarrier,
    setActBarrier,
    actWillingness,
    setActWillingness,
    setActReadingProgress,
    setActDailyCompleted,
    mindfulnessActionId,
    mindfulnessExerciseId,
    goal,
    openActions,
    activeGoalActions,
    hasActModuleAction,
    actModuleAction,
    mindfulnessActions,
    supportedActions,
    selectedActionText,
    canContinueToActionSupport,
    startNewGoal,
    editGoal,
    openGoalEditor,
    saveGoal,
    openActionCreator,
    openActionTypeChoice,
    chooseActionCategory,
    continueToActionSupport,
    saveSelectedAction,
    startImmediateAction,
    openSignaleringsplan,
    saveSignaleringsplan,
    completeSelectedAction,
    removeAction,
    openMindfulnessExercise,
    finishMindfulnessExercise,
    updateActState,
    changeActStage,
    openActDailyAction,
    finishActDailyAction
  } = plan;
  useEffect(() => {
    if (!pendingPsychoeducation) return;
    if (step === "dashboard") {
      navigate("OPEN_LEARNING");
      return;
    }
    if (step === "learning") {
      void psychoeducationRef.current?.openContent(pendingPsychoeducation);
      setPendingPsychoeducation(null);
    }
  }, [step, pendingPsychoeducation, navigate]);

  const [actLanguageVersion, setActLanguageVersion] =
    useState<ActLanguageVersion | null>(null);
  const [draftActLanguageVersion, setDraftActLanguageVersion] =
    useState<ActLanguageVersion | null>(null);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  function savePreference(key: string, value: string) {
    setStorageUnavailable(!writePreference(key, value));
  }

  const isDashboardTour = isDashboardTourStep(step);
  const isDashboardScreen = step === "dashboard" || isDashboardTour;

  function openLearning(origin: "dashboard" | "actionsSpecify") {
    setLearningOrigin(origin);
    navigate("OPEN_LEARNING");
    window.setTimeout(() => psychoeducationRef.current?.open(), 0);
  }

  function openLearningDetail(id: string) {
    navigate("OPEN_LEARNING_DETAIL");
  }

  function backFromLearningDetail() {
    navigate("LEARNING_DETAIL_BACK_TO_LEARNING");
  }

  function backFromLearning() {
    navigate(learningOrigin === "actionsSpecify" ? "OPEN_ACTION_SPECIFY" : "LEARNING_BACK_TO_DASHBOARD");
  }

  function startActionNow() {
    if (!selectedActionCategory || !selectedActionTemplate) return;
    const immediateActionId = startImmediateAction();
    if (immediateActionId === null) return;
    setNowActionId(immediateActionId);
    if (selectedActionCategory === "learn") {
      const opensLibraryItem = ![
        "recovery-stories",
        "personal-recovery",
        "network-support",
      ].includes(selectedActionTemplate);
      setPendingPsychoeducation(opensLibraryItem ? selectedActionTemplate : null);
      openLearning("actionsSpecify");
      return;
    }
    if (selectedActionTemplate === "exposure") {
      navigate("OPEN_EXPOSURE_MODULE");
      return;
    }
    if (selectedActionTemplate === "signaleringsplan") {
      navigate("OPEN_SIGNALING_PLAN");
      return;
    }
    if (selectedActionTemplate === "act-practice") {
      setActStage("intro");
      navigate("OPEN_ACT_MODULE");
      return;
    }
    if (selectedActionTemplate.startsWith("mindfulness:")) {
      const exerciseId = selectedActionTemplate.slice("mindfulness:".length);
      const exercise = mindfulnessExercises.find(item => item.id === exerciseId);
      if (exercise) openMindfulnessExercise(exercise.id, immediateActionId);
    }
  }

  function completeImmediateAction() {
    completeSelectedAction();
    setNowActionId(null);
    navigate("GO_HOME");
  }

  function deferImmediateAction() {
    setSelectedActionId(null);
    setNowActionId(null);
    navigate("GO_HOME");
  }

  function openSignaleringsplanAction(actionId: number) {
    setNowActionId(actionId);
    openSignaleringsplan(actionId);
  }

  function finishSignaleringsplan(planData: SignaleringsplanData) {
    if (nowActionId !== null) {
      saveSignaleringsplan(nowActionId, planData);
      completeImmediateAction();
    } else {
      navigate("GO_HOME");
    }
  }

  useEffect(() => {
    if (selectedActionCategory !== "learn") return;
    let active = true;
    fetch("/api/psychoeducation", { cache: "no-store" })
      .then(response => response.json() as Promise<{ items?: PsychoRecord[] }>)
      .then(data => { if (active) setActionPsychoItems(data.items ?? []); })
      .catch(() => { if (active) setActionPsychoItems([]); });
    return () => { active = false; };
  }, [selectedActionCategory]);

  const actionPsychoResults = searchPsychoeducation(actionPsychoItems, actionPsychoQuery).slice(0, 8);

  useEffect(() => {
    emitFlowStepViewed(step);
  }, [step]);

  useEffect(() => {
    // De server-side recovery-plan hook bepaalt na authenticatie of een
    // bestaande patiënt direct naar het dashboard kan.
    setSelectedActionId(null);
  }, [setSelectedActionId]);

  useEffect(() => {
    const storedLanguage = readPreference(
      MODULE_LANGUAGE_STORAGE_KEY,
    );
    if (
      storedLanguage === "simple" ||
      storedLanguage === "standard" ||
      storedLanguage === "scientific"
    ) {
      setActLanguageVersion(storedLanguage);
      setDraftActLanguageVersion(storedLanguage);
    }

  }, []);

  function openActVersionChoice() {
    setDraftActLanguageVersion(actLanguageVersion);
    navigate("OPEN_ACT_LANGUAGE_CHOICE");
  }

  function updateActLanguageVersion(nextVersion: ActLanguageVersion) {
    if (nextVersion !== actLanguageVersion) {
      setActStage("intro");
      setActBarrier("");
      setActWillingness("");
      setActReadingProgress(0);
      setActDailyCompleted(false);
    }

    setActLanguageVersion(nextVersion);
    setDraftActLanguageVersion(nextVersion);
    savePreference(MODULE_LANGUAGE_STORAGE_KEY, nextVersion);
  }

  function confirmActLanguageVersion() {
    if (!draftActLanguageVersion) return;

    updateActLanguageVersion(draftActLanguageVersion);
    navigate(
      hasFinishedOnboarding
        ? "CONFIRM_ACT_LANGUAGE_SETTINGS"
        : "CONFIRM_ACT_LANGUAGE_ONBOARDING",
    );
  }

  function restartOnboarding() {
    // Bestaande doelen en acties blijven bewaard; alleen de rondleiding wordt
    // opnieuw geopend en de gezamenlijke taalkeuze wordt opnieuw aangeboden.
    setSelectedActionId(null);
    setDraftActLanguageVersion(actLanguageVersion);
    setHasFinishedOnboarding(false);
    navigate("RESTART_ONBOARDING");
  }

  function goHome() {
    setSelectedActionId(null);
    navigate("GO_HOME");
  }

  return (
    <main style={styles.page}>
      {storageUnavailable && (
        <p role="status">Je instelling geldt nu voor deze sessie. Deze browser kon de instelling niet bewaren.</p>
      )}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-15vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0.2;
          }
        }

        @keyframes celebrationPop {
          0% { transform: scale(0.75); opacity: 0; }
          55% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-4px) rotate(1deg); }
        }
      `}</style>

      {showCelebration && (
        <div style={styles.celebration} role="status" aria-live="polite">
          {confettiPieces.map((piece, index) => (
            <span
              key={index}
              style={{
                ...styles.confetti,
                left: piece.left,
                backgroundColor: piece.color,
                animationDelay: piece.delay,
                transform: `rotate(${piece.rotate})`,
              }}
            />
          ))}

          <div style={styles.celebrationMessage}>
            <div style={styles.celebrationEmoji}>🎉</div>
            <strong>{celebrationTitle}</strong>
            <span>{celebrationText}</span>
          </div>
        </div>
      )}

      <section
        style={styles.phone}
        data-flow-step={step}
        data-flow-version={USER_FLOW_VERSION}
      >
        <div style={styles.ambientShapeOne} aria-hidden="true" />
        <div style={styles.ambientShapeTwo} aria-hidden="true" />

        {step !== "welcome" &&
          step !== "mindfulnessModule" &&
          !isDashboardScreen && (
            <div style={styles.progressArea} aria-label="Voortgang">
              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${step === "actModule"
                      ? actProgressByStage[actStage]
                      : FLOW_STEP_META[step].progress
                      }%`,
                  }}
                />
              </div>
            </div>
          )}

        <div style={styles.content}>
          {step === "welcome" && (
            <div style={styles.centeredContent}>
              <div style={styles.heroAvatarWrap}>
                <span style={styles.avatarSparkleOne}>✦</span>
                <AssistantAvatar size={94} />
                <span style={styles.avatarSparkleTwo}>✦</span>
              </div>
              <p style={styles.eyebrow}>JOUW HERSTELBUDDY</p>
              <h1 style={styles.title}>Welkom in jouw herstelomgeving</h1>
              <p style={styles.intro}>
                Hoi, ik ben je herstelbuddy. Wil je eerst een korte rondleiding
                door jouw herstelomgeving? Je kunt ook meteen naar de homepagina
                gaan en de rondleiding later bekijken.
              </p>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => navigate("START_ENVIRONMENT_INTRO")}
              >
                Ja, ik wil de rondleiding doen
              </button>
              <button
                type="button"
                style={styles.secondaryActionButton}
                onClick={() => {
                  setHasFinishedOnboarding(true);
                  setSelectedActionId(null);
                  navigate("SKIP_ONBOARDING");
                }}
              >
                Nee, direct naar de homepagina
              </button>
            </div>
          )}

          {step === "environmentIntro" && (
            <div style={styles.centeredContent}>
              <div style={styles.introAvatarRow}>
                <AssistantAvatar size={72} />
                <span style={styles.introAvatarLabel}>Herstelbuddy</span>
              </div>
              <p style={styles.eyebrow}>JOUW PERSOONLIJKE OMGEVING</p>
              <h1 style={styles.title}>Ik laat je graag even rondkijken</h1>
              <p style={styles.intro}>
                Dit is jouw persoonlijke herstelomgeving van het UMC Utrecht
                (UMCU). Ik laat je zien wat je allemaal kunt gebruiken om jouw
                herstel te ondersteunen.
              </p>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => navigate("START_DASHBOARD_TOUR")}
              >
                Start de rondleiding
              </button>
              <button
                type="button"
                style={styles.textButtonWide}
                onClick={() => {
                  setHasFinishedOnboarding(true);
                  setSelectedActionId(null);
                  navigate("SKIP_ONBOARDING");
                }}
              >
                Naar overzicht
              </button>
            </div>
          )}

          {step === "recoveryIntro" && (
            <div style={styles.centeredContent}>
              <div style={styles.introAvatarRow}>
                <AssistantAvatar size={72} />
                <span style={styles.introAvatarLabel}>Herstelbuddy</span>
              </div>
              <p style={styles.eyebrow}>JOUW HERSTEL</p>
              <h1 style={styles.title}>Geef richting aan jouw herstel</h1>
              <p style={styles.intro}>
                De rondleiding is afgerond. Voor goed herstel kan het handig
                zijn doelen aan te maken. De netwerkintake en je behandelaar
                kunnen je hierbij ondersteunen. Wil je nu je eerste doel en
                een mogelijke actie invullen op basis van de netwerkintake?
                Je mag dit ook later vanaf je homepagina doen.
              </p>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={startNewGoal}
              >
                Ja, nu invullen
              </button>
              <button
                type="button"
                style={styles.secondaryActionButton}
                onClick={() => {
                  setHasFinishedOnboarding(true);
                  navigate("SKIP_FIRST_RECOVERY_PLAN");
                }}
              >
                Nee, naar mijn homepagina
              </button>
            </div>
          )}

          {isDashboardScreen && (
            <RecoveryDashboard plan={plan} step={step} navigate={navigate}
              actLanguageVersion={actLanguageVersion} openActVersionChoice={openActVersionChoice}
              restartOnboarding={restartOnboarding}
              onOpenLearning={() => openLearning("dashboard")}
              onOpenCoping={() => setPendingPsychoeducation("coping-toen-en-nu")}
              onOpenSignaleringsplan={openSignaleringsplanAction} />
          )}

          {step === "recoveryPlan" && (
            <RecoveryPlanModule onBack={goHome} />
          )}

          {step === "information" && (
            <section aria-label="Informatie kiezen">
              <p style={styles.eyebrow}>INFORMATIE</p>
              <h1 style={styles.title}>Wat wil je bekijken?</h1>
              <p style={styles.intro}>Kies een herstelverhaal of een korte uitleg over coping.</p>
              <div style={{ ...styles.resourcesGrid, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                <a
                  style={{ ...styles.resourceCard, padding: "22px 18px", minHeight: "150px" }}
                  href="https://verhalenbankpsychiatrie.nl/verhalen-2/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span aria-hidden="true" style={{ ...styles.resourceIcon, ...styles.informationIcon }}>i</span>
                  <strong style={styles.resourceTitle}>Herstelverhalen</strong>
                  <span style={styles.resourceText}>Lees ervaringen van anderen. Opent in een nieuw tabblad.</span>
                </a>
                <button
                  type="button"
                  style={{ ...styles.resourceCard, padding: "22px 18px", minHeight: "150px" }}
                  onClick={() => {
                    setPendingPsychoeducation("coping-toen-en-nu");
                    navigate("GO_HOME");
                  }}
                >
                  <span aria-hidden="true" style={{ ...styles.resourceIcon, ...styles.practiceIcon }}>i</span>
                  <strong style={styles.resourceTitle}>Coping toen en nu</strong>
                  <span style={styles.resourceText}>Hoe wat je vroeger hielp later in de weg kan zitten.</span>
                </button>
              </div>
              <button type="button" style={{ ...styles.smallButton, marginTop: "22px" }} onClick={goHome}>Naar homepagina</button>
            </section>
          )}

          {step === "practice" && (
            <div>
              <p style={styles.eyebrow}>OEFENEN</p>
              <h1 style={styles.title}>Zet een kleine stap</h1>
              <p style={styles.intro}>
                Hier kun je verdergaan met een dagelijkse oefening of een
                nieuwe concrete actie aan jouw herstelplan toevoegen.
              </p>

              {actModuleAction ? (
                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={() => openActDailyAction(actModuleAction.id)}
                >
                  Start mijn dagelijkse ACT-oefening
                </button>
              ) : (
                <div style={styles.emptyCard}>
                  Je hebt nog geen dagelijkse ACT-oefening toegevoegd.
                </div>
              )}

              <section style={styles.mindfulnessCatalog}>
                <p style={styles.eyebrow}>MINDFULNESS</p>
                <h2 style={styles.sectionTitle}>Korte aandachtsoefeningen</h2>
                <p style={styles.actionDetailsHint}>
                  Bekijk een oefening direct. Wil je haar plannen en op je
                  dashboard zetten, voeg haar dan als afzonderlijke actie toe
                  via Oefenen.
                </p>
                <div style={styles.mindfulnessExerciseList}>
                  {mindfulnessExercises.map((exercise) => {
                    const linkedAction = mindfulnessActions.find(
                      (action) =>
                        action.mindfulnessExerciseId === exercise.id,
                    );

                    return (
                      <button
                        key={exercise.id}
                        type="button"
                        style={styles.mindfulnessExerciseCard}
                        onClick={() =>
                          openMindfulnessExercise(
                            exercise.id,
                            linkedAction?.id ?? null,
                          )
                        }
                      >
                        <span style={styles.mindfulnessExerciseTitle}>
                          {exercise.title}
                        </span>
                        <span style={styles.mindfulnessExerciseMeta}>
                          {exercise.duration}
                          {linkedAction ? " · staat in mijn acties" : ""}
                        </span>
                        <span style={styles.mindfulnessExerciseSummary}>
                          {exercise.summary}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <button
                type="button"
                style={actModuleAction ? styles.secondaryActionButton : styles.primaryButton}
                onClick={() => openActionCreator()}
              >
                Nieuwe actie toevoegen
              </button>
              <button
                type="button"
                style={styles.textButtonWide}
                onClick={goHome}
              >
                Terug naar mijn herstelplan
              </button>
            </div>
          )}

          {step === "contact" && (
            <div>
              <p style={styles.eyebrow}>CONTACT</p>
              <h1 style={styles.title}>Ondersteuning bij mijn acties</h1>
              <p style={styles.intro}>
                Ondersteuning wordt per actie vastgelegd. Zo blijft duidelijk
                wie waarbij kan helpen en op welke manier.
              </p>

              {supportedActions.length > 0 ? (
                <div style={styles.actionList}>
                  {supportedActions.map((action) => (
                    <div key={action.id} style={styles.supportCard}>
                      <span style={styles.cardLabel}>{action.text}</span>
                      <p style={styles.cardText}>
                        <strong>{action.support?.name}</strong>
                        {action.support?.how
                          ? ` · ${action.support.how}`
                          : " ondersteunt bij deze actie."}
                      </p>
                      <span style={styles.actionMetaLine}>
                        <span aria-hidden="true">🗓</span>
                        {formatActionSchedule(action.schedule)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyCard}>
                  Je hebt nog bij geen enkele actie ondersteuning toegevoegd.
                </div>
              )}

              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => openActionCreator()}
              >
                Nieuwe actie met ondersteuning toevoegen
              </button>
              <button
                type="button"
                style={styles.textButtonWide}
                onClick={goHome}
              >
                Terug naar mijn herstelplan
              </button>
            </div>
          )}

          {step === "settings" && (
            <div>
              <p style={styles.eyebrow}>INSTELLINGEN</p>
              <h1 style={styles.title}>Pas jouw herstelomgeving aan</h1>
              <p style={styles.intro}>
                Kies welk taalniveau bij je past en wanneer je een korte
                dagelijkse herinnering voor je ACT-oefening wilt ontvangen.
              </p>

              <section style={styles.settingsCard}>
                <div style={styles.settingsSectionHeader}>
                  <span style={styles.settingsSectionIcon} aria-hidden="true">
                    Aa
                  </span>
                  <div>
                    <h2 style={styles.settingsSectionTitle}>
                      Taalniveau van modules
                    </h2>
                    <p style={styles.settingsSectionText}>
                      De gekozen versie wordt gebruikt voor de ACT-module.
                    </p>
                  </div>
                </div>

                <div style={styles.settingsLanguageList}>
                  {actLanguageVersionOptions.map((option) => {
                    const isSelected = actLanguageVersion === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={isSelected}
                        style={{
                          ...styles.settingsLanguageOption,
                          ...(isSelected
                            ? styles.selectedSettingsLanguageOption
                            : {}),
                        }}
                        onClick={() => {
                          updateActLanguageVersion(option.id);
                          setSettingsMessage(
                            `Taalniveau aangepast naar ${option.label}.`,
                          );
                        }}
                      >
                        <span style={styles.settingsLanguageBody}>
                          <strong>{option.label}</strong>
                          <span>{option.description}</span>
                        </span>
                        <span
                          style={{
                            ...styles.settingsRadio,
                            ...(isSelected
                              ? styles.selectedSettingsRadio
                              : {}),
                          }}
                          aria-hidden="true"
                        >
                          {isSelected ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p style={styles.settingsFootnote}>
                  Bij een ander taalniveau begint alleen de leesvoortgang van
                  de ACT-module opnieuw. Je hersteldoel en acties blijven
                  bewaard.
                </p>
              </section>

              <PwaInstallHelp />
              <NotificationSettings />
            </div>
          )}

          {step === "goalPicker" && (
            <section>
              <h1 style={styles.title}>{goalPickerPurpose !== "edit" ? "Bij welk hersteldoel hoort deze actie?" : "Welk hersteldoel wil je aanpassen?"}</h1>
              <div style={styles.actionList}>
                {goals.map(item => (
                  <button key={item.id} type="button" style={styles.actionCard} onClick={() => goalPickerPurpose === "template" ? chooseTemplateGoal(item.id) : goalPickerPurpose === "action" ? openActionCreator(item.id) : editGoal(item.id)}>{item.text}</button>
                ))}
              </div>
              <button type="button" style={styles.secondaryActionButton} onClick={goalPickerPurpose === "template" ? startTemplateGoal : startNewGoal}>+ Nieuw hersteldoel</button>
              <button type="button" style={styles.textButtonWide} onClick={goHome}>Naar overzicht</button>
            </section>
          )}

          {step === "goal" && (
            <div>
              <p style={styles.eyebrow}>HERSTELDOEL</p>
              <h1 style={styles.title}>Wat zou ik willen veranderen?</h1>
              <p style={styles.intro}>
                Beschrijf iets waardoor het dagelijks leven een beetje beter
                voor je zou worden.
              </p>
              <textarea
                style={styles.textarea}
                rows={5}
                value={goalDraft}
                onChange={(event) => setGoalDraft(event.target.value)}
                placeholder="Bijvoorbeeld: ik zou beter willen slapen."
              />
              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  ...(!goalDraft.trim() ? styles.disabledButton : {}),
                }}
                disabled={!goalDraft.trim()}
                onClick={() => saveGoal(true)}
              >
                Doel opslaan en acties toevoegen
              </button>
              <button type="button" style={styles.secondaryActionButton} disabled={!goalDraft.trim()} onClick={() => saveGoal(false)}>
                Doel opslaan en naar overzicht
              </button>
              <button
                type="button"
                style={styles.textButtonWide}
                onClick={() =>
                  navigate(
                    hasFinishedOnboarding
                      ? "GO_HOME"
                      : "GOAL_BACK_TO_RECOVERY_INTRO",
                  )
                }
              >
                Terug
              </button>
            </div>
          )}

          {step === "actions" && (
            <div>
              <p style={styles.eyebrow}>EERSTE ACTIES</p>
              <h1 style={styles.title}>Acties bij dit hersteldoel</h1>
              <p style={styles.goalText}>{goal}</p>
              <p style={styles.intro}>
                Kies een actie die past bij jouw hersteldoel. Je kunt iets met
                iemand ondernemen, oefenen of iets nieuws leren.
              </p>

              <button
                type="button"
                style={styles.primaryButton}
                onClick={openActionTypeChoice}
              >
                + Nieuwe actie maken
              </button>

              {activeGoalActions.length > 0 && (
                <div style={styles.addedActionsBox}>
                  <span style={styles.cardLabel}>Acties in jouw plan</span>
                  {activeGoalActions.map((action) => (
                    <div key={action.id} style={styles.addedActionRow}>
                      <span style={styles.addedActionDescription}>
                        <span style={styles.addedActionType}>
                          <ActionTypeIcon category={action.category} size={17} />
                          {actionCategoryLabels[action.category]}
                        </span>
                        <span>{action.text}</span>
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
                      </span>
                      {!action.completed && (
                        <button
                          type="button"
                          style={styles.removeButton}
                          aria-label={`Verwijder ${action.text}`}
                          onClick={() => removeAction(action.id)}
                        >
                          Verwijderen
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                style={{
                  ...styles.primaryButton,

                }}
                onClick={() => navigate("ACTIONS_CONTINUE")}
              >
                Verder
              </button>

              <button
                type="button"
                style={styles.textButtonWide}
                onClick={() =>
                  hasFinishedOnboarding ? goHome() : activeGoalId ? editGoal(activeGoalId) : startNewGoal()
                }
              >
                Terug
              </button>
            </div>
          )}

          {step === "actionsSpecify" && (
            <div>
              <p style={styles.eyebrow}>NIEUWE ACTIE</p>
              <h1 style={styles.title}>Wat voor actie wil je maken?</h1>
              <p style={styles.intro}>
                Kies eerst een soort actie. Daarna kun je de actie concreet
                maken of een passende suggestie kiezen.
              </p>

              <div style={styles.actionTypeGrid}>
                {(
                  [
                    {
                      category: "contact",
                      title: "Contact",
                      text: "Iets doen om contact met iemand te krijgen.",
                    },
                    {
                      category: "practice",
                      title: "Oefenen",
                      text: "Een vaardigheid of kleine stap oefenen.",
                    },
                    {
                      category: "learn",
                      title: "Leren",
                      text: "Informatie of ervaringen van anderen bekijken.",
                    },
                  ] as const
                ).map((option) => {
                  const isChosen = selectedActionCategory === option.category;

                  return (
                    <button
                      key={option.category}
                      type="button"
                      aria-pressed={isChosen}
                      aria-expanded={isChosen}
                      style={{
                        ...styles.actionTypeCard,
                        ...styles[`${option.category}ActionTypeCard`],
                        ...(isChosen ? styles.selectedActionTypeCard : {}),
                      }}
                      onClick={() => chooseActionCategory(option.category)}
                    >
                      <span style={styles.actionTypeIconWrap}>
                        <ActionTypeIcon category={option.category} />
                      </span>
                      <strong style={styles.actionTypeTitle}>{option.title}</strong>
                      <span style={styles.actionTypeText}>{option.text}</span>
                      <span style={styles.actionTypeChoiceMark}>
                        {isChosen ? "✓ Gekozen" : "Kiezen"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedActionCategory === "contact" && (
                <section style={styles.actionDetailsPanel}>
                  <label style={styles.label} htmlFor="contact-action">
                    Wat wil je doen en met wie?
                  </label>
                  <input
                    id="contact-action"
                    style={styles.inputFull}
                    value={newAction}
                    onChange={(event) => setNewAction(event.target.value)}
                    placeholder="Bijvoorbeeld: mijn zus bellen en samen wandelen"
                    autoFocus
                  />
                </section>
              )}

              {selectedActionCategory === "practice" && (
                <section style={styles.actionDetailsPanel}>
                  <label style={styles.label} htmlFor="practice-action">
                    Wat wil je oefenen?
                  </label>
                  <select
                    id="practice-action"
                    style={styles.select}
                    value={selectedActionTemplate}
                    onChange={(event) =>
                      setSelectedActionTemplate(event.target.value)
                    }
                    autoFocus
                  >
                    <option value="">Kies een oefening…</option>
                    {practiceActionOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={
                          option.value === "act-practice" && hasActModuleAction
                        }
                      >
                        {option.label}
                        {option.value === "act-practice" && hasActModuleAction
                          ? " (al toegevoegd)"
                          : ""}
                      </option>
                    ))}
                  </select>
                  {selectedActionTemplate === "act-practice" && (
                    <p style={styles.actionDetailsHint}>
                      Hiermee voeg je ACT oefenen als actie toe. De module
                      start pas wanneer je haar vanuit het dashboard opent.
                    </p>
                  )}
                  {selectedActionTemplate.startsWith("mindfulness:") && (
                    <p style={styles.actionDetailsHint}>
                      Deze korte mindfulnessoefening wordt een losse actie op
                      je dashboard. Vanuit die actie open je direct de juiste
                      oefening.
                    </p>
                  )}
                </section>
              )}

              {selectedActionCategory === "learn" && (
                <section style={styles.actionDetailsPanel}>
                  <label style={styles.label} htmlFor="learn-action">
                    Waarover wil je leren?
                  </label>
                  <select
                    id="learn-action"
                    style={styles.select}
                    value={selectedActionTemplate}
                    onChange={(event) =>
                      setSelectedActionTemplate(event.target.value)
                    }
                    autoFocus
                  >
                    <option value="">Kies wat je wilt leren…</option>
                    {learningActionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <label style={styles.label} htmlFor="psychoeducation-action-search">
                    Of zoek in de psychoeducatiebibliotheek
                  </label>
                  <input
                    id="psychoeducation-action-search"
                    style={styles.inputFull}
                    value={actionPsychoQuery}
                    onChange={(event) => setActionPsychoQuery(event.target.value)}
                    placeholder="Zoek bijvoorbeeld op ACT, spanning of waarden"
                  />
                  {actionPsychoQuery.trim() && (
                    <div style={styles.actionList}>
                      {actionPsychoResults.map((item) => (
                        <div key={item.content.id} style={styles.actionList}>
                          <button type="button" style={styles.templateButton} onClick={() => setSelectedActionTemplate(item.content.id)}>
                            Kies als leeractie: {item.content.title}
                          </button>
                          <button type="button" style={styles.textButton} onClick={() => { setLearningOrigin("actionsSpecify"); setPendingPsychoeducation(item.content.id); navigate("OPEN_LEARNING"); }}>
                            Bekijk uitleg eerst
                          </button>
                        </div>
                      ))}
                      {!actionPsychoResults.length && (
                        <p style={styles.actionDetailsHint}>
                          Geen passende gepubliceerde uitleg gevonden.
                        </p>
                      )}
                    </div>
                  )}
                </section>
              )}

              {(selectedActionCategory === "learn" || selectedActionCategory === "practice") && selectedActionTemplate && (
                <section style={styles.actionDetailsPanel}>
                  <h2 style={styles.actionOptionHeading}>Wanneer wil je dit doen?</h2>
                  <p style={styles.actionDetailsHint}>
                    Kies nu oefenen of leren, of sla het op als actie voor later.
                  </p>
                  <div style={styles.segmentedChoice}>
                    <button type="button" aria-pressed={actionTiming === "now"} style={{ ...styles.segmentButton, ...(actionTiming === "now" ? styles.activeSegmentButton : {}) }} onClick={() => { setActionTiming("now"); startActionNow(); }}>
                      Nu doen
                    </button>
                    <button type="button" aria-pressed={actionTiming === "later"} style={{ ...styles.segmentButton, ...(actionTiming === "later" ? styles.activeSegmentButton : {}) }} onClick={() => setActionTiming("later")}>
                      Als actie voor later
                    </button>
                  </div>
                </section>
              )}

              {selectedActionCategory && (selectedActionCategory === "contact" || actionTiming === "later") && (
                <section style={styles.actionDetailsPanel}>
                  <h2 style={styles.actionOptionHeading}>Planning van deze actie</h2>
                  <div style={styles.segmentedChoice}>
                    <button
                      type="button"
                      aria-pressed={actionRepeatMode === "once"}
                      style={{
                        ...styles.segmentButton,
                        ...(actionRepeatMode === "once"
                          ? styles.activeSegmentButton
                          : {}),
                      }}
                      onClick={() => setActionRepeatMode("once")}
                    >
                      Eenmalig
                    </button>
                    <button
                      type="button"
                      aria-pressed={actionRepeatMode === "recurring"}
                      style={{
                        ...styles.segmentButton,
                        ...(actionRepeatMode === "recurring"
                          ? styles.activeSegmentButton
                          : {}),
                      }}
                      onClick={() => setActionRepeatMode("recurring")}
                    >
                      Herhaald
                    </button>
                  </div>

                  {actionRepeatMode === "once" ? (
                    <div style={styles.planningGrid}>
                      <label style={styles.compactFieldLabel}>
                        Datum <span style={styles.optionalText}>(optioneel)</span>
                        <input
                          type="date"
                          style={styles.compactInput}
                          value={actionDate}
                          onChange={(event) => setActionDate(event.target.value)}
                        />
                      </label>
                      <label style={styles.compactFieldLabel}>
                        Tijd <span style={styles.optionalText}>(optioneel)</span>
                        <input
                          type="time"
                          style={styles.compactInput}
                          value={actionTime}
                          onChange={(event) => setActionTime(event.target.value)}
                        />
                      </label>
                    </div>
                  ) : (
                    <>
                      <div style={styles.planningGrid}>
                        <label style={styles.compactFieldLabel}>
                          Herhaling
                          <select
                            style={styles.compactInput}
                            value={actionFrequency}
                            onChange={(event) =>
                              setActionFrequency(
                                event.target.value as ActionFrequency,
                              )
                            }
                          >
                            <option value="daily">Dagelijks</option>
                            <option value="weekly">Wekelijks</option>
                          </select>
                        </label>
                        <label style={styles.compactFieldLabel}>
                          Tijd
                          <input
                            type="time"
                            required
                            style={styles.compactInput}
                            value={actionTime}
                            onChange={(event) => setActionTime(event.target.value)}
                          />
                        </label>
                      </div>
                      {actionFrequency === "weekly" && (
                        <label style={styles.compactFieldLabel}>
                          Dag van de week
                          <select
                            style={styles.compactInput}
                            value={actionWeekday}
                            onChange={(event) =>
                              setActionWeekday(event.target.value)
                            }
                          >
                            {weekdayOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <p style={styles.actionDetailsHint}>
                        Een herhaalde actie blijft op je dashboard staan. Je
                        rondt iedere uitvoering afzonderlijk af.
                      </p>
                    </>
                  )}
                </section>
              )}

              {selectedActionCategory && (selectedActionCategory === "contact" || actionTiming === "later") && (
              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  ...(!canContinueToActionSupport
                    ? styles.disabledButton
                    : {}),
                }}
                disabled={!canContinueToActionSupport}
                onClick={continueToActionSupport}
              >
                {selectedActionCategory === "practice" && selectedActionTemplate === "exposure" ? "Verder naar ondersteuning" : "Actie opslaan"}
              </button>)}
              <button
                type="button"
                style={styles.textButtonWide}
                onClick={() => navigate("ACTION_SPECIFY_BACK")}
              >
                Terug naar mijn acties
              </button>
            </div>
          )}

          {step === "supportChoice" && (
            <div>
              <p style={styles.eyebrow}>DEZE ACTIE · ONDERSTEUNING</p>
              <h1 style={styles.title}>Kan een ander je hierbij ondersteunen?</h1>
              <div style={styles.draftActionCard}>
                <strong>{selectedActionText}</strong>
                <span>{formatActionSchedule({
                  repeatMode: actionRepeatMode,
                  frequency:
                    actionRepeatMode === "recurring"
                      ? actionFrequency
                      : undefined,
                  date: actionDate || undefined,
                  time: actionTime || undefined,
                  weekday:
                    actionRepeatMode === "recurring" &&
                      actionFrequency === "weekly"
                      ? actionWeekday
                      : undefined,
                })}</span>
              </div>
              <p style={styles.intro}>
                Denk bijvoorbeeld aan samen beginnen, meegaan, herinneren of
                achteraf vragen hoe het ging.
              </p>
              <button
                type="button"
                style={styles.choiceButton}
                onClick={() => {
                  navigate("ACTION_SUPPORT_YES");
                }}
              >
                Ja, iemand kan mij ondersteunen
              </button>
              <button
                type="button"
                style={styles.choiceButton}
                onClick={() => {
                  setDraftSupporter("");
                  setDraftSupportHow("");
                  saveSelectedAction(false);
                }}
              >
                Nee, nu nog niet
              </button>
              <button
                type="button"
                style={styles.textButtonWide}
                onClick={() => navigate("ACTION_SUPPORT_BACK")}
              >
                Terug
              </button>
            </div>
          )}

          {step === "supportWho" && (
            <div>
              <p style={styles.eyebrow}>DEZE ACTIE · ONDERSTEUNING</p>
              <h1 style={styles.title}>Wie zou jou kunnen ondersteunen?</h1>

              <div style={styles.draftActionCard}>
                <strong>{selectedActionText}</strong>
              </div>

              <label style={styles.label} htmlFor="supporter">
                Persoon
              </label>
              <input
                id="supporter"
                style={styles.inputFull}
                value={draftSupporter}
                onChange={(event) => setDraftSupporter(event.target.value)}
                placeholder="Bijvoorbeeld: mijn vriend Sam"
              />

              <label style={styles.label} htmlFor="support-how">
                Hoe zou deze persoon kunnen helpen?
              </label>
              <textarea
                id="support-how"
                style={styles.textarea}
                rows={4}
                value={draftSupportHow}
                onChange={(event) => setDraftSupportHow(event.target.value)}
                placeholder="Bijvoorbeeld: de eerste keer met mij meelopen"
              />

              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  ...(!draftSupporter.trim() ? styles.disabledButton : {}),
                }}
                disabled={!draftSupporter.trim()}
                onClick={() => saveSelectedAction(true)}
              >
                Ondersteuning en actie opslaan
              </button>
              <button
                type="button"
                style={styles.textButtonWide}
                onClick={() => navigate("ACTION_SUPPORT_DETAILS_BACK")}
              >
                Terug
              </button>
            </div>
          )}

          {step === "actModule" && (
            <>
              <ActModule
                goal={goal}
                version={actLanguageVersion ?? "standard"}
                stage={actStage}
                barrier={actBarrier}
                willingness={actWillingness}
                onStageChange={changeActStage}
                onBarrierChange={(value) => { setActBarrier(value); if (actActionId !== null) updateActState(actActionId, { barrier: value }); }}
                onWillingnessChange={(value) => { setActWillingness(value); if (actActionId !== null) updateActState(actActionId, { willingness: value }); }}
                onFinish={nowActionId !== null ? completeImmediateAction : finishActDailyAction}
              />
              {nowActionId !== null && <div style={styles.immediateActionFooter}><button type="button" style={styles.primaryButton} onClick={completeImmediateAction}>Actie voltooien</button><button type="button" style={styles.textButtonWide} onClick={deferImmediateAction}>Actie voor later</button></div>}
            </>
          )}

          {step === "mindfulnessModule" && mindfulnessExerciseId && (
            <>
              <MindfulnessModule
                key={`${mindfulnessExerciseId}-${mindfulnessActionId ?? "preview"}`}
                exerciseId={mindfulnessExerciseId}
                onFinish={nowActionId !== null ? completeImmediateAction : finishMindfulnessExercise}
                onBack={goHome}
              />
              {nowActionId !== null && <div style={styles.immediateActionFooter}><button type="button" style={styles.primaryButton} onClick={completeImmediateAction}>Actie voltooien</button><button type="button" style={styles.textButtonWide} onClick={deferImmediateAction}>Actie voor later</button></div>}
            </>
          )}

          {step === "exposureModule" && (
            <>
              <ExposureModule
                onFinish={nowActionId !== null ? completeImmediateAction : () => navigate("FINISH_EXPOSURE_MODULE")}
                onBack={deferImmediateAction}
              />
              {nowActionId !== null && <div style={styles.immediateActionFooter}><button type="button" style={styles.primaryButton} onClick={completeImmediateAction}>Actie voltooien</button><button type="button" style={styles.textButtonWide} onClick={deferImmediateAction}>Actie voor later</button></div>}
            </>
          )}

          {step === "signalingPlan" && (
            <SignaleringsplanModule
              key={nowActionId ?? "personal-plan"}
              initialPlan={actions.find(action => action.id === nowActionId)?.signaleringsplan}
              linkedAction={nowActionId !== null}
              onFinish={finishSignaleringsplan}
              onBack={nowActionId !== null ? deferImmediateAction : goHome}
            />
          )}

          {step === "actVersionChoice" && (
            <div>
              <p style={styles.eyebrow}>SAMEN MET JE BEHANDELAAR</p>
              <h1 style={styles.title}>Welke ACT-versie past bij jou?</h1>
              <p style={styles.intro}>
                Kies samen hoeveel taal en achtergrondinformatie je wilt zien.
                De oefeningen hebben hetzelfde doel, maar de uitleg en
                informatiediepte verschillen. Er is geen goede of foute keuze
                en je kunt de versie later aanpassen.
              </p>

              <div style={styles.sharedChoicePrompt}>
                <AssistantAvatar size={50} />
                <p style={styles.sharedChoiceText}>
                  Bespreek samen: wat leest prettig, hoeveel uitleg helpt en
                  hoeveel wetenschappelijke verdieping wil je op dit moment?
                </p>
              </div>

              <div style={styles.actVersionList}>
                {actLanguageVersionOptions.map((option, index) => {
                  const isSelected =
                    draftActLanguageVersion === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={isSelected}
                      style={{
                        ...styles.actVersionOption,
                        ...(isSelected
                          ? styles.selectedActVersionOption
                          : {}),
                      }}
                      onClick={() => setDraftActLanguageVersion(option.id)}
                    >
                      <span style={styles.actVersionNumber}>{index + 1}</span>
                      <span style={styles.actVersionOptionBody}>
                        <strong style={styles.actVersionOptionTitle}>
                          {option.label}
                        </strong>
                        <span style={styles.actVersionOptionDescription}>
                          {option.description}
                        </span>
                        <span style={styles.actVersionOptionDetail}>
                          {option.detail}
                        </span>
                      </span>
                      <span style={styles.actVersionCheck} aria-hidden="true">
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  ...(!draftActLanguageVersion
                    ? styles.disabledButton
                    : {}),
                }}
                disabled={!draftActLanguageVersion}
                onClick={confirmActLanguageVersion}
              >
                Deze versie samen kiezen
              </button>
              <button
                type="button"
                style={styles.textButtonWide}
                onClick={() =>
                  navigate(
                    hasFinishedOnboarding
                      ? "ACT_LANGUAGE_BACK_TO_DASHBOARD"
                      : "ACT_LANGUAGE_BACK_TO_TOUR",
                  )
                }
              >
                Terug
              </button>
            </div>
          )}


        </div>

        <PsychoeducationLibrary
          ref={psychoeducationRef}
          visible={step === "learning" || step === "learningDetail"}
          onBack={backFromLearning}
          onOpenDetail={openLearningDetail}
          onDetailBack={backFromLearningDetail}
          immediateActionActive={nowActionId !== null}
          onCompleteImmediate={completeImmediateAction}
          onDeferImmediate={deferImmediateAction}
          storageKey="recovery-buddy:psychoeducation:local-pilot"
        />

        <RecoveryBuddy
          onOpenPractice={() => navigate("OPEN_PRACTICE")}
          onOpenAction={(actionId) => {
            const action = actions.find(item => String(item.id) === actionId && !item.completed);
            if (!action) return;
            plan.setActiveGoalId(action.goalId);
            setSelectedActionId(action.id);
            if (action.kind === "actModule") plan.openActReading(action.id);
            else if (action.kind === "mindfulness" && action.mindfulnessExerciseId) openMindfulnessExercise(action.mindfulnessExerciseId, action.id);
            else if (action.kind === "signalingPlan") openSignaleringsplanAction(action.id);
            else navigate("GO_HOME");
          }}
          onOpenSignaleringsplan={() => { setNowActionId(null); setSelectedActionId(null); navigate("OPEN_SIGNALING_PLAN"); }}
          onOpenLearning={() => openLearning("dashboard")}
          onSuggestPsychoeducation={async (text, topic) =>
            step === "dashboard"
              ? (await psychoeducationRef.current?.suggest(text, topic)) ?? false
              : false
          }
          onClearPsychoeducation={() => psychoeducationRef.current?.clearSuggestions()}
          active={isDashboardScreen}
          forceCollapsed={isDashboardTour}
          highlighted={step === "tourBuddy"}
          goal={goals.map(item => item.text).join("; ")}
          openActionCount={openActions.length}
          openActions={openActions.map((action) => ({
            id: action.id,
            title: action.text,
            actionType:
              action.category === "learn"
                ? "LEARN"
                : action.category === "practice"
                  ? "PRACTICE"
                  : "CONTACT",
          }))}
          currentScreen={step}
          selectedActionId={selectedActionId}
          hasActModule={Boolean(actModuleAction)}
          onOpenGoal={openGoalEditor}
          onAddAction={() => openActionCreator()}
          onOpenActDaily={() => {
            if (actModuleAction) openActDailyAction(actModuleAction.id);
          }}
        />

        {step === "tourHome" && (
          <OnboardingTour
            stage="home"
            onBack={() => navigate("TOUR_HOME_BACK")}
            onNext={() => navigate("TOUR_HOME_NEXT")}
          />
        )}

        {step === "tourBuddy" && (
          <OnboardingTour
            stage="buddy"
            onBack={() => navigate("TOUR_BUDDY_BACK")}
            onNext={() => navigate("TOUR_BUDDY_NEXT")}
          />
        )}

        {step === "tourGoals" && (
          <OnboardingTour
            stage="goals"
            onBack={() => navigate("TOUR_GOALS_BACK")}
            onNext={() => navigate("TOUR_GOALS_NEXT")}
          />
        )}

        {step === "tourActions" && (
          <OnboardingTour
            stage="actions"
            onBack={() => navigate("TOUR_ACTIONS_BACK")}
            onNext={() => navigate("TOUR_ACTIONS_NEXT")}
          />
        )}

        {step === "tourInformation" && (
          <OnboardingTour
            stage="information"
            onBack={() => navigate("TOUR_INFORMATION_BACK")}
            onNext={() => navigate("TOUR_INFORMATION_NEXT")}
          />
        )}

        {step === "tourPractice" && (
          <OnboardingTour
            stage="practice"
            onBack={() => navigate("TOUR_PRACTICE_BACK")}
            onNext={() => navigate("TOUR_PRACTICE_NEXT")}
          />
        )}

        {step === "tourContact" && (
          <OnboardingTour
            stage="contact"
            onBack={() => navigate("TOUR_CONTACT_BACK")}
            onNext={() => {
              setDraftActLanguageVersion(actLanguageVersion);
              navigate("TOUR_CONTACT_NEXT");
            }}
          />
        )}

        {step !== "welcome" && (
          <nav
            style={{
              ...styles.bottomNavigation,
              ...(step === "tourHome"
                ? styles.tourHighlightedNavigation
                : {}),
            }}
            aria-label="Hoofdnavigatie"
          >
            {([
              { label: "Home", icon: "⌂", target: "dashboard", event: "GO_HOME" },
              { label: "Informatie", icon: "ⓘ", target: "information", event: "OPEN_INFORMATION" },
              { label: "Oefenen", icon: "✓", target: "practice", event: "OPEN_PRACTICE" },
              { label: "Instellingen", icon: "⚙", target: "settings", event: "OPEN_SETTINGS" },
            ] as const).map(item => (
              <button key={item.target} type="button" style={{ ...styles.homeButton, ...(step !== item.target ? styles.inactiveNavButton : {}), ...(step === "tourHome" && item.target === "dashboard" ? styles.tourHighlightedHomeButton : {}) }}
                disabled={isDashboardTour || !hasFinishedOnboarding}
                aria-current={step === item.target ? "page" : undefined}
                onClick={() => { setNowActionId(null); setSelectedActionId(null); setSettingsMessage(""); navigate(item.event); }}>
                <span style={styles.homeIcon} aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 12% 10%, #ffd3df 0, transparent 28%), radial-gradient(circle at 88% 18%, #cfe4ff 0, transparent 30%), linear-gradient(145deg, #f5efff 0%, #fff7f5 52%, #eaf4ff 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "24px 12px",
    fontFamily: '"Segoe UI", "Avenir Next", Arial, sans-serif',
    color: "#262343",
  },
  phone: {
    width: "100%",
    maxWidth: "460px",
    minHeight: "calc(100vh - 48px)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #f8f6ff 42%, #fff9fb 100%)",
    border: "1px solid rgba(255, 255, 255, 0.9)",
    borderRadius: "32px",
    boxShadow: "0 24px 70px rgba(69, 62, 126, 0.2)",
    overflow: "hidden",
    position: "relative",
    paddingBottom: "calc(112px + env(safe-area-inset-bottom, 0px))",
  },
  avatar: {
    position: "relative",
    flexShrink: 0,
    borderRadius: "46% 54% 50% 50% / 52% 44% 56% 48%",
    background: "linear-gradient(145deg, #ff799e 0%, #ff9f93 100%)",
    boxShadow:
      "inset 0 -5px 12px rgba(180, 67, 104, 0.12), 0 8px 18px rgba(237, 103, 144, 0.25)",
    animation: "avatarFloat 3.5s ease-in-out infinite",
  },
  avatarEye: {
    position: "absolute",
    top: "37%",
    width: "8%",
    height: "11%",
    minWidth: "3px",
    minHeight: "4px",
    borderRadius: "50%",
    backgroundColor: "#39304d",
  },
  avatarSmile: {
    position: "absolute",
    left: "50%",
    top: "49%",
    width: "29%",
    height: "15%",
    transform: "translateX(-50%)",
    borderBottom: "3px solid #39304d",
    borderRadius: "0 0 999px 999px",
  },
  heroAvatarWrap: {
    width: "135px",
    height: "122px",
    margin: "0 auto 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: "45% 55% 58% 42% / 45% 42% 58% 55%",
    background:
      "linear-gradient(145deg, rgba(232, 224, 255, 0.88), rgba(255, 226, 236, 0.92))",
  },
  avatarSparkleOne: {
    position: "absolute",
    top: "5px",
    right: "8px",
    color: "#5d59df",
    fontSize: "22px",
  },
  avatarSparkleTwo: {
    position: "absolute",
    bottom: "8px",
    left: "4px",
    color: "#ff7899",
    fontSize: "16px",
  },
  ambientShapeOne: {
    position: "absolute",
    width: "190px",
    height: "190px",
    borderRadius: "50%",
    backgroundColor: "rgba(225, 216, 255, 0.42)",
    top: "115px",
    right: "-105px",
    filter: "blur(2px)",
    pointerEvents: "none",
  },
  ambientShapeTwo: {
    position: "absolute",
    width: "145px",
    height: "145px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 211, 225, 0.35)",
    bottom: "145px",
    left: "-85px",
    filter: "blur(2px)",
    pointerEvents: "none",
  },
  progressArea: {
    padding: "14px 24px 0",
    position: "relative",
    zIndex: 2,
  },
  progressTrack: {
    height: "5px",
    overflow: "hidden",
    borderRadius: "999px",
    backgroundColor: "#e9e5f8",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #5b5ce2, #8b69ec)",
    transition: "width 300ms ease",
  },
  content: {
    padding: "28px 24px 42px",
    position: "relative",
    zIndex: 1,
  },
  centeredContent: {
    textAlign: "center",
    paddingTop: "46px",
  },
  introAvatarRow: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "7px",
    marginBottom: "19px",
  },
  introAvatarLabel: {
    color: "#6f67a0",
    fontSize: "12px",
    fontWeight: 800,
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    color: "#645bb5",
    backgroundColor: "#eeebff",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.15px",
    padding: "7px 10px",
    margin: "0 0 14px",
  },
  title: {
    color: "#262343",
    fontSize: "29px",
    fontWeight: 800,
    letterSpacing: "-0.8px",
    lineHeight: 1.2,
    margin: "0 0 16px",
  },
  intro: {
    color: "#66617f",
    fontSize: "16px",
    lineHeight: 1.58,
    margin: "0 0 26px",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    border: "1px solid rgba(210, 203, 238, 0.72)",
    borderRadius: "8px 22px 22px 22px",
    padding: "16px 17px",
    textAlign: "left",
    boxShadow: "0 8px 22px rgba(73, 62, 130, 0.07)",
  },
  primaryButton: {
    width: "100%",
    border: 0,
    borderRadius: "18px",
    background: "linear-gradient(135deg, #5657df 0%, #6f5ee7 100%)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 800,
    padding: "16px 20px",
    cursor: "pointer",
    marginTop: "14px",
    boxShadow: "0 10px 24px rgba(82, 78, 205, 0.26)",
  },
  disabledButton: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  choiceButton: {
    width: "100%",
    border: "1.5px solid #dad4fa",
    borderRadius: "18px",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    color: "#39345c",
    fontSize: "16px",
    fontWeight: 700,
    textAlign: "left",
    padding: "17px 19px",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 7px 20px rgba(73, 62, 130, 0.08)",
  },
  textButtonWide: {
    width: "100%",
    border: 0,
    background: "transparent",
    color: "#676188",
    fontWeight: 700,
    cursor: "pointer",
    padding: "14px",
    marginTop: "5px",
  },
  settingsCard: {
    border: "1px solid #e2dcf3",
    borderRadius: "24px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: "18px",
    marginBottom: "16px",
    boxShadow: "0 9px 24px rgba(69, 59, 120, 0.07)",
  },
  settingsSectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  },
  settingsSectionIcon: {
    width: "40px",
    height: "40px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    background: "linear-gradient(145deg, #ebe7ff, #ffe9f1)",
    color: "#5a53bd",
    fontSize: "15px",
    fontWeight: 900,
  },
  settingsSectionTitle: {
    color: "#342f54",
    fontSize: "18px",
    lineHeight: 1.3,
    margin: "1px 0 4px",
  },
  settingsSectionText: {
    color: "#79728d",
    fontSize: "13px",
    lineHeight: 1.45,
    margin: 0,
  },
  settingsLanguageList: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },
  settingsLanguageOption: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "1.5px solid #e2ddf1",
    borderRadius: "17px",
    backgroundColor: "#ffffff",
    color: "#47415f",
    padding: "13px",
    textAlign: "left",
    cursor: "pointer",
  },
  selectedSettingsLanguageOption: {
    border: "2px solid #625bdd",
    background: "linear-gradient(145deg, #f0edff, #fff2f6)",
    padding: "12.5px",
  },
  settingsLanguageBody: {
    minWidth: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "14px",
    lineHeight: 1.4,
  },
  settingsRadio: {
    width: "25px",
    height: "25px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #c6bfdc",
    borderRadius: "999px",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 900,
  },
  selectedSettingsRadio: {
    borderColor: "#625bdd",
    backgroundColor: "#625bdd",
  },
  settingsFootnote: {
    color: "#878197",
    fontSize: "12px",
    lineHeight: 1.5,
    margin: "13px 2px 0",
  },
  reminderToggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    borderTop: "1px solid #eeeaf5",
    borderBottom: "1px solid #eeeaf5",
    padding: "14px 0",
  },
  reminderToggleTitle: {
    display: "block",
    color: "#403a5d",
    fontSize: "14px",
    marginBottom: "3px",
  },
  permissionText: {
    display: "block",
    color: "#888197",
    fontSize: "11px",
    lineHeight: 1.35,
  },
  reminderSwitchButton: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: 0,
    background: "transparent",
    color: "#5d5772",
    fontSize: "12px",
    fontWeight: 800,
    padding: "5px 0",
    cursor: "pointer",
  },
  reminderSwitchTrack: {
    position: "relative",
    display: "block",
    width: "44px",
    height: "25px",
    borderRadius: "999px",
    backgroundColor: "#d8d2e4",
    transition: "background-color 180ms ease",
  },
  activeReminderSwitchTrack: {
    backgroundColor: "#625bdd",
  },
  reminderSwitchThumb: {
    position: "absolute",
    top: "3px",
    left: "3px",
    width: "19px",
    height: "19px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 6px rgba(45, 38, 82, 0.25)",
    transition: "transform 180ms ease",
  },
  activeReminderSwitchThumb: {
    transform: "translateX(19px)",
  },
  reminderTimeLabel: {
    display: "block",
    color: "#4b4569",
    fontSize: "13px",
    fontWeight: 800,
    margin: "17px 0 7px",
  },
  reminderTimeInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1.5px solid #d9d3eb",
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    color: "#383251",
    fontFamily: "inherit",
    fontSize: "16px",
    padding: "12px 14px",
    outlineColor: "#625bdd",
  },
  quotePreview: {
    borderRadius: "20px",
    background: "linear-gradient(145deg, #3e376f, #695bbb)",
    color: "#ffffff",
    padding: "19px",
    marginTop: "16px",
    boxShadow: "0 10px 22px rgba(63, 53, 130, 0.18)",
  },
  quotePreviewLabel: {
    display: "block",
    color: "#d9d4ff",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.8px",
    marginBottom: "10px",
  },
  quotePreviewText: {
    fontSize: "16px",
    lineHeight: 1.55,
    margin: 0,
  },
  quoteDetails: {
    borderBottom: "1px solid #ece7f4",
    padding: "13px 2px",
  },
  quoteSummary: {
    color: "#5a54bd",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
  },
  quoteList: {
    color: "#6f6980",
    fontSize: "13px",
    lineHeight: 1.5,
    paddingLeft: "20px",
    margin: "12px 0 2px",
  },
  testNotificationButton: {
    width: "100%",
    border: "1.5px solid #625bdd",
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    color: "#554fc1",
    fontSize: "13px",
    fontWeight: 900,
    padding: "12px 14px",
    marginTop: "14px",
    cursor: "pointer",
  },
  settingsStatus: {
    borderRadius: "13px",
    backgroundColor: "#eef9f4",
    color: "#34725f",
    fontSize: "12px",
    lineHeight: 1.45,
    padding: "10px 12px",
    margin: "12px 0 0",
  },
  prototypeNotice: {
    borderRadius: "14px",
    backgroundColor: "#fff7df",
    color: "#76643b",
    fontSize: "11px",
    lineHeight: 1.5,
    padding: "11px 12px",
    margin: "12px 0 0",
  },
  secondaryActionButton: {
    width: "100%",
    border: "1.5px solid #625bdd",
    borderRadius: "18px",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    color: "#554fc1",
    fontSize: "15px",
    fontWeight: 800,
    padding: "14px 18px",
    cursor: "pointer",
    marginTop: "12px",
  },
  mindfulnessCatalog: {
    marginTop: "22px",
    borderTop: "1px solid #e4def3",
    paddingTop: "20px",
  },
  mindfulnessExerciseList: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    marginTop: "13px",
  },
  mindfulnessExerciseCard: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "5px",
    border: "1.5px solid #cfe7df",
    borderRadius: "17px",
    background: "linear-gradient(145deg, #f2fbf8, #ffffff)",
    color: "#353151",
    fontFamily: "inherit",
    padding: "14px 15px",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(55, 119, 101, 0.07)",
  },
  mindfulnessExerciseTitle: {
    color: "#346f60",
    fontSize: "15px",
    fontWeight: 900,
  },
  mindfulnessExerciseMeta: {
    color: "#6b8b82",
    fontSize: "11px",
    fontWeight: 800,
  },
  mindfulnessExerciseSummary: {
    color: "#706a82",
    fontSize: "12px",
    lineHeight: 1.45,
  },
  smallButton: {
    border: 0,
    borderRadius: "999px",
    backgroundColor: "#e9e5ff",
    color: "#544db2",
    fontWeight: 800,
    padding: "10px 14px",
    cursor: "pointer",
  },
  goalText: {
    margin: "15px 0 0",
    color: "#353151",
    fontSize: "16px",
    lineHeight: 1.55,
    whiteSpace: "pre-wrap",
  },
  supportCard: {
    background: "linear-gradient(145deg, #eef5ff, #f3efff)",
    border: "1px solid #e0daf7",
    borderRadius: "22px",
    padding: "19px",
    marginTop: "28px",
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "1px solid #e5e0f5",
    borderRadius: "20px",
    padding: "18px",
    marginBottom: "13px",
    boxShadow: "0 7px 18px rgba(69, 59, 120, 0.06)",
  },
  cardLabel: {
    display: "block",
    color: "#6961a9",
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "7px",
  },
  cardText: {
    fontSize: "16px",
    lineHeight: 1.5,
    margin: "0 0 13px",
    whiteSpace: "pre-wrap",
    color: "#353151",
  },
  emptyText: {
    color: "#85809b",
    fontSize: "15px",
    lineHeight: 1.5,
    margin: "0 0 13px",
  },
  sectionTitle: {
    fontSize: "19px",
    color: "#302b50",
    fontWeight: 800,
    margin: 0,
  },
  emptyCard: {
    border: "1px dashed #cfc7ee",
    borderRadius: "18px",
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    color: "#7f7895",
    padding: "17px",
    fontSize: "14px",
  },
  actionList: {
    display: "flex",
    flexDirection: "column",
    gap: "11px",
  },
  actionCard: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "1.5px solid #e1dcf6",
    borderRadius: "18px",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    color: "#3a3556",
    padding: "15px",
    fontSize: "15px",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 7px 18px rgba(67, 57, 122, 0.07)",
  },
  resourcesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "9px",
    marginTop: "13px",
  },
  resourceCard: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "7px",
    border: "1px solid #e0daf5",
    borderRadius: "18px",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    color: "#39345c",
    padding: "12px 9px",
    textAlign: "left",
    textDecoration: "none",
    cursor: "pointer",
    boxShadow: "0 7px 18px rgba(67, 57, 122, 0.07)",
  },
  resourceIcon: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "11px",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 900,
  },
  informationIcon: {
    background: "linear-gradient(145deg, #5a87df, #7264e8)",
  },
  practiceIcon: {
    background: "linear-gradient(145deg, #5fc39e, #5aaec5)",
  },
  resourceTitle: {
    color: "#3b355d",
    fontSize: "13px",
  },
  resourceText: {
    color: "#77708d",
    fontSize: "10px",
    lineHeight: 1.35,
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1.5px solid #d7d0f0",
    borderRadius: "18px",
    padding: "15px",
    fontFamily: "inherit",
    fontSize: "16px",
    lineHeight: 1.5,
    resize: "vertical",
    color: "#302c4e",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    boxShadow: "0 6px 16px rgba(73, 62, 130, 0.05)",
    outlineColor: "#6964df",
  },
  inputFull: {
    width: "100%",
    boxSizing: "border-box",
    border: "1.5px solid #d7d0f0",
    borderRadius: "16px",
    padding: "14px",
    fontSize: "15px",
    color: "#302c4e",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    outlineColor: "#6964df",
    marginBottom: "20px",
  },
  select: {
    width: "100%",
    boxSizing: "border-box",
    border: "1.5px solid #d7d0f0",
    borderRadius: "16px",
    padding: "14px 42px 14px 14px",
    fontFamily: "inherit",
    fontSize: "15px",
    color: "#302c4e",
    backgroundColor: "#ffffff",
    outlineColor: "#6964df",
    cursor: "pointer",
  },
  label: {
    display: "block",
    color: "#4b456d",
    fontSize: "14px",
    fontWeight: 800,
    margin: "20px 0 8px",
  },
  actionOptionHeading: {
    color: "#3a3558",
    fontSize: "15px",
    margin: "0 0 10px",
  },
  actionTypeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "9px",
    marginTop: "18px",
  },
  actionTypeCard: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    border: "1.5px solid #ded8f3",
    borderRadius: "20px",
    color: "#393455",
    padding: "13px 10px",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(67, 57, 122, 0.07)",
  },
  selectedActionTypeCard: {
    border: "2px solid #625bdd",
    padding: "12.5px 9.5px",
    transform: "translateY(-2px)",
    boxShadow: "0 12px 26px rgba(82, 78, 205, 0.17)",
  },
  actionTypeIconWrap: {
    width: "45px",
    height: "45px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    color: "#5c56c8",
  },
  actionTypeTitle: {
    fontSize: "15px",
    lineHeight: 1.2,
  },
  actionTypeText: {
    minHeight: "48px",
    color: "#77708b",
    fontSize: "11px",
    lineHeight: 1.42,
  },
  actionTypeChoiceMark: {
    marginTop: "auto",
    color: "#5b54c3",
    fontSize: "11px",
    fontWeight: 900,
  },
  actionDetailsPanel: {
    marginTop: "17px",
    border: "1px solid #ded8f2",
    borderRadius: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    padding: "0 16px 16px",
  },
  segmentedChoice: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "14px",
  },
  segmentButton: {
    border: "1.5px solid #d7d0ef",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    color: "#6d6685",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: 800,
    padding: "11px 12px",
    cursor: "pointer",
  },
  activeSegmentButton: {
    borderColor: "#625bdd",
    backgroundColor: "#ece9ff",
    color: "#514ab2",
    boxShadow: "0 5px 12px rgba(82, 78, 205, 0.12)",
  },
  planningGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  compactFieldLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    color: "#4b456d",
    fontSize: "12px",
    fontWeight: 800,
    marginTop: "10px",
  },
  optionalText: {
    color: "#8a849d",
    fontWeight: 500,
  },
  compactInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1.5px solid #d7d0f0",
    borderRadius: "13px",
    backgroundColor: "#ffffff",
    color: "#302c4e",
    fontFamily: "inherit",
    fontSize: "13px",
    padding: "11px",
    outlineColor: "#6964df",
  },
  draftActionCard: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    border: "1px solid #ded8f2",
    borderRadius: "18px",
    background: "linear-gradient(145deg, #f1edff, #fff2f6)",
    color: "#494263",
    fontSize: "14px",
    lineHeight: 1.45,
    padding: "15px",
    marginBottom: "17px",
  },
  actionDetailsHint: {
    margin: "10px 0 0",
    color: "#716a86",
    fontSize: "12px",
    lineHeight: 1.45,
  },
  actionMetaLine: {
    display: "flex",
    alignItems: "flex-start",
    gap: "6px",
    color: "#756f88",
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  summaryActionItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "12px",
  },
  sharedChoicePrompt: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    border: "1px solid #f0cbd9",
    borderRadius: "22px",
    background: "linear-gradient(145deg, #fff0f6, #f1edff)",
    color: "#564d70",
    fontSize: "14px",
    lineHeight: 1.5,
    padding: "15px",
    marginBottom: "18px",
  },
  sharedChoiceText: {
    margin: 0,
  },
  actVersionList: {
    display: "flex",
    flexDirection: "column",
    gap: "11px",
  },
  actVersionOption: {
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    border: "1.5px solid #ddd7f2",
    borderRadius: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    color: "#3b355b",
    padding: "15px",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 7px 19px rgba(69, 59, 120, 0.07)",
  },
  selectedActVersionOption: {
    border: "2px solid #625bdd",
    background: "linear-gradient(145deg, #efecff, #fff1f6)",
    padding: "14.5px",
    boxShadow: "0 10px 24px rgba(82, 78, 205, 0.15)",
  },
  actVersionNumber: {
    width: "29px",
    height: "29px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#e9e5ff",
    color: "#5b54c3",
    fontSize: "13px",
    fontWeight: 900,
  },
  actVersionOptionBody: {
    minWidth: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  actVersionOptionTitle: {
    color: "#393359",
    fontSize: "16px",
    lineHeight: 1.35,
  },
  actVersionOptionDescription: {
    color: "#655e7e",
    fontSize: "14px",
    lineHeight: 1.45,
  },
  actVersionOptionDetail: {
    color: "#89839a",
    fontSize: "12px",
    lineHeight: 1.45,
  },
  actVersionCheck: {
    width: "25px",
    height: "25px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    backgroundColor: "#625bdd",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 900,
  },
  addedActionsBox: {
    backgroundColor: "rgba(240, 237, 255, 0.75)",
    border: "1px solid #e0daf6",
    borderRadius: "18px",
    padding: "16px",
    marginTop: "17px",
  },
  addedActionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "8px 0",
    borderBottom: "1px solid #e1dcf3",
    fontSize: "14px",
    lineHeight: 1.4,
  },
  addedActionDescription: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  addedActionType: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#6d66a2",
    fontSize: "10px",
    fontWeight: 900,
    textTransform: "uppercase",
  },
  removeButton: {
    border: 0,
    background: "transparent",
    color: "#b64f71",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    padding: "5px",
  },
  summaryList: {
    margin: "5px 0 0",
    paddingLeft: "20px",
    lineHeight: 1.6,
  },
  bottomNavigation: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 24px)",
    maxWidth: "460px",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    bottom: 0,
    height: "78px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderTop: "1px solid rgba(105, 93, 180, 0.12)",
    backdropFilter: "blur(14px)",
    zIndex: 5,
  },
  tourHighlightedNavigation: {
    zIndex: 70,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    pointerEvents: "none",
    boxShadow:
      "0 0 0 6px rgba(255, 255, 255, 0.88), 0 -12px 34px rgba(49, 37, 94, 0.3)",
  },
  homeButton: {
    minWidth: 0,
    flex: 1,
    border: 0,
    borderRadius: "18px",
    backgroundColor: "#eeebff",
    color: "#5751ba",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1px",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
    padding: "8px 2px",
  },
  inactiveNavButton: {
    backgroundColor: "transparent",
    color: "#817a94",
    boxShadow: "none",
  },
  settingsIcon: {
    fontSize: "23px",
    lineHeight: 1,
  },
  tourHighlightedHomeButton: {
    transform: "scale(1.28)",
    background: "linear-gradient(145deg, #ffffff, #f0edff)",
    color: "#514bb8",
    boxShadow: "0 10px 25px rgba(78, 69, 165, 0.28)",
  },
  homeIcon: {
    fontSize: "25px",
    lineHeight: 1,
  },
  tourHighlightedHomeIcon: {
    fontSize: "34px",
  },
  celebration: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(48, 39, 84, 0.24)",
    backdropFilter: "blur(3px)",
    pointerEvents: "none",
  },
  confetti: {
    position: "absolute",
    top: "-30px",
    width: "13px",
    height: "25px",
    borderRadius: "3px",
    animation: "confettiFall 2.1s linear forwards",
  },
  celebrationMessage: {
    width: "min(310px, calc(100vw - 48px))",
    borderRadius: "28px",
    background: "linear-gradient(145deg, #ffffff, #fff1f6)",
    boxShadow: "0 22px 65px rgba(60, 44, 112, 0.3)",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "7px",
    color: "#322c54",
    fontSize: "18px",
    textAlign: "center",
    animation: "celebrationPop 0.4s ease-out forwards",
  },
  celebrationEmoji: {
    fontSize: "54px",
    marginBottom: "3px",
  },
};
