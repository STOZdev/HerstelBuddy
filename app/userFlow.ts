export type StepId =
  | "welcome"
  | "environmentIntro"
  | "tourHome"
  | "tourBuddy"
  | "tourGoals"
  | "tourActions"
  | "recoveryIntro"
  | "goalPicker"
  | "goal"
  | "actions"
  | "actionsSpecify"
  | "supportChoice"
  | "supportWho"
  | "summary"
  | "tourInformation"
  | "tourPractice"
  | "tourContact"
  | "actVersionChoice"
  | "dashboard"
  | "recoveryPlan"
  | "information"
  | "learning"
  | "learningDetail"
  | "practice"
  | "contact"
  | "settings"
  | "actModule"
  | "mindfulnessModule"
  | "exposureModule"
  | "signalingPlan";

export type FlowEventType =
  | "RESET_FLOW"
  | "SKIP_ONBOARDING"
  | "START_ENVIRONMENT_INTRO"
  | "BACK_TO_WELCOME"
  | "START_DASHBOARD_TOUR"
  | "TOUR_HOME_BACK"
  | "TOUR_HOME_NEXT"
  | "TOUR_BUDDY_BACK"
  | "TOUR_BUDDY_NEXT"
  | "TOUR_GOALS_BACK"
  | "TOUR_GOALS_NEXT"
  | "TOUR_ACTIONS_BACK"
  | "TOUR_ACTIONS_NEXT"
  | "RECOVERY_INTRO_BACK"
  | "GOAL_BACK_TO_RECOVERY_INTRO"
  | "OPEN_GOAL_PICKER"
  | "OPEN_GOAL"
  | "OPEN_ACTIONS"
  | "OPEN_ACTION_SPECIFY"
  | "ACTION_SPECIFY_BACK"
  | "ACTION_SPECIFY_CONTINUE"
  | "ACTIONS_BACK"
  | "ACTIONS_CONTINUE"
  | "ACTION_SUPPORT_YES"
  | "ACTION_SUPPORT_NO"
  | "ACTION_SUPPORT_BACK"
  | "ACTION_SUPPORT_DETAILS_SAVE"
  | "ACTION_SUPPORT_DETAILS_BACK"
  | "SUMMARY_BACK_TO_ACTIONS"
  | "SUMMARY_SAVE_TO_DASHBOARD"
  | "TOUR_INFORMATION_BACK"
  | "TOUR_INFORMATION_NEXT"
  | "TOUR_PRACTICE_BACK"
  | "TOUR_PRACTICE_NEXT"
  | "TOUR_CONTACT_BACK"
  | "TOUR_CONTACT_NEXT"
  | "CONFIRM_ACT_LANGUAGE_ONBOARDING"
  | "CONFIRM_ACT_LANGUAGE_SETTINGS"
  | "ACT_LANGUAGE_BACK_TO_TOUR"
  | "ACT_LANGUAGE_BACK_TO_DASHBOARD"
  | "OPEN_INFORMATION"
  | "OPEN_RECOVERY_PLAN"
  | "OPEN_LEARNING"
  | "LEARNING_BACK_TO_DASHBOARD"
  | "OPEN_LEARNING_DETAIL"
  | "LEARNING_DETAIL_BACK_TO_LEARNING"
  | "LEARNING_DETAIL_BACK_TO_DASHBOARD"
  | "LEARNING_DETAIL_BACK_TO_ACTIONS"
  | "OPEN_PRACTICE"
  | "OPEN_CONTACT"
  | "OPEN_ACT_MODULE"
  | "FINISH_ACT_DAILY_ACTION"
  | "SKIP_FIRST_RECOVERY_PLAN"
  | "OPEN_MINDFULNESS_EXERCISE"
  | "FINISH_MINDFULNESS_EXERCISE"
  | "OPEN_EXPOSURE_MODULE"
  | "FINISH_EXPOSURE_MODULE"
  | "OPEN_SIGNALING_PLAN"
  | "FINISH_SIGNALING_PLAN"
  | "OPEN_ACT_LANGUAGE_CHOICE"
  | "OPEN_SETTINGS"
  | "GO_HOME"
  | "RESTART_ONBOARDING";

export const USER_FLOW_VERSION = "recovery-flow-v5.5.0";

export const FLOW_STEP_META: Record<StepId, { progress: number }> = {
  welcome: { progress: 0 },
  environmentIntro: { progress: 12 },
  tourHome: { progress: 22 },
  tourBuddy: { progress: 32 },
  tourGoals: { progress: 38 },
  tourActions: { progress: 44 },
  tourInformation: { progress: 52 },
  tourPractice: { progress: 60 },
  tourContact: { progress: 68 },
  actVersionChoice: { progress: 74 },
  recoveryIntro: { progress: 80 },
  goalPicker: { progress: 100 },
  goal: { progress: 86 },
  actions: { progress: 90 },
  actionsSpecify: { progress: 93 },
  supportChoice: { progress: 95 },
  supportWho: { progress: 97 },
  summary: { progress: 100 },
  dashboard: { progress: 100 },
  recoveryPlan: { progress: 100 },
  information: { progress: 100 },
  learning: { progress: 100 },
  learningDetail: { progress: 100 },
  practice: { progress: 100 },
  contact: { progress: 100 },
  settings: { progress: 100 },
  actModule: { progress: 0 },
  mindfulnessModule: { progress: 0 },
  exposureModule: { progress: 0 },
  signalingPlan: { progress: 0 },
};

// Navigatiebron voor page.tsx en het flowoverzicht.
export const FLOW_TARGETS: Record<FlowEventType, StepId> = {
  RESET_FLOW: "welcome",
  SKIP_ONBOARDING: "dashboard",
  START_ENVIRONMENT_INTRO: "environmentIntro",
  BACK_TO_WELCOME: "welcome",
  START_DASHBOARD_TOUR: "tourHome",
  TOUR_HOME_BACK: "environmentIntro",
  TOUR_HOME_NEXT: "tourBuddy",
  TOUR_BUDDY_BACK: "tourHome",
  TOUR_BUDDY_NEXT: "tourGoals",
  TOUR_GOALS_BACK: "tourBuddy",
  TOUR_GOALS_NEXT: "tourActions",
  TOUR_ACTIONS_BACK: "tourGoals",
  TOUR_ACTIONS_NEXT: "tourInformation",
  RECOVERY_INTRO_BACK: "actVersionChoice",
  GOAL_BACK_TO_RECOVERY_INTRO: "recoveryIntro",
  OPEN_GOAL_PICKER: "goalPicker",
  OPEN_GOAL: "goal",
  OPEN_ACTIONS: "actions",
  OPEN_ACTION_SPECIFY: "actionsSpecify",
  ACTION_SPECIFY_BACK: "actions",
  ACTION_SPECIFY_CONTINUE: "supportChoice",
  ACTIONS_BACK: "goal",
  ACTIONS_CONTINUE: "summary",
  ACTION_SUPPORT_YES: "supportWho",
  ACTION_SUPPORT_NO: "actions",
  ACTION_SUPPORT_BACK: "actionsSpecify",
  ACTION_SUPPORT_DETAILS_SAVE: "actions",
  ACTION_SUPPORT_DETAILS_BACK: "supportChoice",
  SUMMARY_BACK_TO_ACTIONS: "actions",
  SUMMARY_SAVE_TO_DASHBOARD: "dashboard",
  TOUR_INFORMATION_BACK: "tourActions",
  TOUR_INFORMATION_NEXT: "tourPractice",
  TOUR_PRACTICE_BACK: "tourInformation",
  TOUR_PRACTICE_NEXT: "tourContact",
  TOUR_CONTACT_BACK: "tourPractice",
  TOUR_CONTACT_NEXT: "actVersionChoice",
  CONFIRM_ACT_LANGUAGE_ONBOARDING: "recoveryIntro",
  CONFIRM_ACT_LANGUAGE_SETTINGS: "dashboard",
  ACT_LANGUAGE_BACK_TO_TOUR: "tourContact",
  ACT_LANGUAGE_BACK_TO_DASHBOARD: "dashboard",
  OPEN_INFORMATION: "information",
  OPEN_RECOVERY_PLAN: "recoveryPlan",
  OPEN_LEARNING: "learning",
  LEARNING_BACK_TO_DASHBOARD: "dashboard",
  OPEN_LEARNING_DETAIL: "learningDetail",
  LEARNING_DETAIL_BACK_TO_LEARNING: "learning",
  LEARNING_DETAIL_BACK_TO_DASHBOARD: "dashboard",
  LEARNING_DETAIL_BACK_TO_ACTIONS: "actionsSpecify",
  OPEN_PRACTICE: "practice",
  OPEN_CONTACT: "contact",
  OPEN_ACT_MODULE: "actModule",
  FINISH_ACT_DAILY_ACTION: "dashboard",
  SKIP_FIRST_RECOVERY_PLAN: "dashboard",
  OPEN_MINDFULNESS_EXERCISE: "mindfulnessModule",
  FINISH_MINDFULNESS_EXERCISE: "dashboard",
  OPEN_EXPOSURE_MODULE: "exposureModule",
  FINISH_EXPOSURE_MODULE: "dashboard",
  OPEN_SIGNALING_PLAN: "signalingPlan",
  FINISH_SIGNALING_PLAN: "dashboard",
  OPEN_ACT_LANGUAGE_CHOICE: "actVersionChoice",
  OPEN_SETTINGS: "settings",
  GO_HOME: "dashboard",
  RESTART_ONBOARDING: "welcome",
};

export { navigationReducer } from "./navigationReducer";

export function isDashboardTourStep(step: StepId) {
  return (
    step === "tourHome" ||
    step === "tourBuddy" ||
    step === "tourGoals" ||
    step === "tourActions" ||
    step === "tourInformation" ||
    step === "tourPractice" ||
    step === "tourContact"
  );
}

export type FlowTelemetryDetail = {
  event: "flow_step_viewed";
  stepId: StepId;
  flowVersion: string;
  timestamp: string;
};

/**
 * Privacyvriendelijk lokaal flow-event. Dit verstuurt geen gegevens en bevat
 * geen hersteldoel, stemming, namen of andere vrije tekst.
 */
export function emitFlowStepViewed(stepId: StepId) {
  if (typeof window === "undefined") return;

  const detail: FlowTelemetryDetail = {
    event: "flow_step_viewed",
    stepId,
    flowVersion: USER_FLOW_VERSION,
    timestamp: new Date().toISOString(),
  };

  window.dispatchEvent(
    new CustomEvent<FlowTelemetryDetail>("recovery-flow", { detail }),
  );

  // Alleen een allowlisted flow-event wordt verstuurd. Er gaan geen doelen,
  // stemming, namen of vrije tekst mee naar de server.
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(detail),
    keepalive: true,
  }).catch(() => undefined);
}
