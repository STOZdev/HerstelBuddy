import type { ActStage } from "./ActModule";
import { mindfulnessExercises, type MindfulnessExerciseId } from "./MindfulnessModule";
import type { SignaleringsplanData } from "./SignaleringsplanModule";

export type ActionCategory = "contact" | "practice" | "learn";
export type ActionRepeatMode = "once" | "recurring";
export type ActionFrequency = "daily" | "weekly";
export type ActionTiming = "now" | "later";

export type ActionSchedule = {
  repeatMode: ActionRepeatMode;
  frequency?: ActionFrequency;
  date?: string;
  time?: string;
  weekday?: string;
};

export type ActionSupport = {
  name: string;
  how?: string;
};

export type RecoveryGoal = { id: string; text: string };

export type RecoveryAction = {
  goalId: string;
  actState?: { stage: ActStage; progress: number; barrier: string; willingness: string; lastCompletedOn?: string };
  id: number;
  text: string;
  completed: boolean;
  kind: "standard" | "actModule" | "mindfulness" | "signalingPlan";
  category: ActionCategory;
  schedule: ActionSchedule;
  support?: ActionSupport;
  completionCount: number;
  lastCompletedOn?: string;
  resourceUrl?: string;
  mindfulnessExerciseId?: MindfulnessExerciseId;
  signaleringsplan?: SignaleringsplanData;
};

export const actionCategoryLabels: Record<ActionCategory, string> = {
  contact: "Contact",
  practice: "Oefenen",
  learn: "Leren",
};

export type PracticeActionOption = {
  value: string;
  label: string;
};

export const practiceActionOptions: readonly PracticeActionOption[] = [
  { value: "act-practice", label: "ACT oefenen" },
  { value: "exposure", label: "Exposure oefenen" },
  { value: "signaleringsplan", label: "Mijn signaleringsplan invullen" },
  ...mindfulnessExercises.map((exercise) => ({
    value: `mindfulness:${exercise.id}`,
    label: exercise.actionLabel,
  })),
  { value: "relaxation", label: "Een ontspanningsoefening doen" },
  { value: "daily-structure", label: "Mijn dagstructuur oefenen" },
];

export const learningActionOptions = [
  { value: "recovery-stories", label: "Herstelverhalen lezen" },
  {
    value: "personal-recovery",
    label: "Leren wat persoonlijk herstel betekent",
  },
  {
    value: "network-support",
    label: "Leren hoe mijn netwerk kan ondersteunen",
  },
  ...Array.from({ length: 10 }, (_, index) => ({
    value: [
      "act-psychologische-flexibiliteit",
      "act-waarden-en-richting",
      "act-gedachten-opmerken",
      "act-bladeren-op-de-stroom",
      "act-ruimte-maken-voor-gevoelens",
      "act-hier-en-nu",
      "act-het-observerende-zelf",
      "act-waardenactie-kleine-stap",
      "act-controle-en-vermijding",
      "act-terugval-en-opnieuw-beginnen",
    ][index],
    label: [
      "ACT: psychologische flexibiliteit",
      "ACT: waarden en richting",
      "ACT: gedachten opmerken",
      "ACT-oefening: bladeren op de stroom",
      "ACT: ruimte maken voor gevoelens",
      "ACT-oefening: terug naar het hier en nu",
      "ACT: het observerende zelf",
      "ACT: een kleine waardegerichte stap",
      "ACT: controle en vermijding onderzoeken",
      "ACT: omgaan met terugslag",
    ][index],
  })),
] as const;

export const weekdayOptions = [
  { value: "monday", label: "maandag" },
  { value: "tuesday", label: "dinsdag" },
  { value: "wednesday", label: "woensdag" },
  { value: "thursday", label: "donderdag" },
  { value: "friday", label: "vrijdag" },
  { value: "saturday", label: "zaterdag" },
  { value: "sunday", label: "zondag" },
] as const;

export function formatActionSchedule(schedule: ActionSchedule) {
  const timeText = schedule.time ? ` om ${schedule.time}` : "";

  if (schedule.repeatMode === "recurring") {
    if (schedule.frequency === "weekly") {
      const weekday =
        weekdayOptions.find((option) => option.value === schedule.weekday)
          ?.label ?? "gekozen dag";
      return `Elke ${weekday}${timeText}`;
    }

    return `Dagelijks${timeText}`;
  }

  if (schedule.date) {
    const date = new Date(`${schedule.date}T12:00:00`);
    return `${new Intl.DateTimeFormat("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)}${timeText}`;
  }

  return schedule.time ? `Eenmalig om ${schedule.time}` : "Eenmalig";
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function actionWasCompletedToday(action: RecoveryAction) {
  return action.lastCompletedOn === localDateKey();
}


export const contactActionOptions = [
  { value: "Iemand bellen", label: "Iemand bellen" },
  { value: "Samen een wandeling maken", label: "Samen een wandeling maken" },
  { value: "Iemand om hulp vragen", label: "Iemand om hulp vragen" },
] as const;
