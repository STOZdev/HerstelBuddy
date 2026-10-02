"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

export type MindfulnessExerciseId =
  | "three-minute-breathing"
  | "five-senses"
  | "short-body-scan"
  | "thoughts-as-clouds";

type ExerciseStep = {
  title: string;
  text: string;
};

export type MindfulnessExercise = {
  id: MindfulnessExerciseId;
  title: string;
  actionLabel: string;
  duration: string;
  summary: string;
  steps: readonly ExerciseStep[];
};

export const mindfulnessExercises = [
  {
    id: "three-minute-breathing",
    title: "Drie minuten ademruimte",
    actionLabel: "Mindfulness: drie minuten ademruimte",
    duration: "ongeveer 3 minuten",
    summary: "Sta kort stil bij wat je merkt en breng je aandacht rustig naar je ademhaling.",
    steps: [
      {
        title: "Aankomen",
        text: "Neem een houding aan die voor jou prettig genoeg is. Je ogen mogen openblijven. Merk op welke gedachten, gevoelens en lichamelijke gewaarwordingen er nu zijn, zonder iets te hoeven veranderen.",
      },
      {
        title: "Ademhaling volgen",
        text: "Breng je aandacht naar de plek waar je de adem het duidelijkst voelt. Volg een paar ademhalingen zoals ze vanzelf komen. Dwaalt je aandacht af? Merk dat vriendelijk op en keer terug.",
      },
      {
        title: "Aandacht verbreden",
        text: "Laat je aandacht breder worden: voel je ademhaling én je lichaam als geheel. Merk ook geluiden en de ruimte om je heen op. Kies daarna bewust je volgende kleine stap.",
      },
    ],
  },
  {
    id: "five-senses",
    title: "5-4-3-2-1 met je zintuigen",
    actionLabel: "Mindfulness: 5-4-3-2-1 zintuigenoefening",
    duration: "ongeveer 3–5 minuten",
    summary: "Richt je aandacht stap voor stap op wat je hier en nu kunt waarnemen.",
    steps: [
      {
        title: "Kijken",
        text: "Noem rustig vijf dingen die je ziet. Kijk alsof je ze voor het eerst opmerkt: kleur, vorm, licht en schaduw.",
      },
      {
        title: "Voelen en horen",
        text: "Merk vier dingen op die je lichamelijk voelt, bijvoorbeeld je voeten op de vloer. Luister daarna naar drie geluiden, dichtbij of verder weg.",
      },
      {
        title: "Ruiken en proeven",
        text: "Merk twee geuren en één smaak op. Is iets niet duidelijk waarneembaar, merk dan eenvoudig op dat dit zo is. Rond af met één rustige ademhaling.",
      },
    ],
  },
  {
    id: "short-body-scan",
    title: "Korte bodyscan",
    actionLabel: "Mindfulness: korte bodyscan",
    duration: "ongeveer 5 minuten",
    summary: "Ga met een nieuwsgierige aandacht langs verschillende delen van je lichaam.",
    steps: [
      {
        title: "Contact maken",
        text: "Voel waar je lichaam contact maakt met de stoel, het bed of de vloer. Merk druk, temperatuur of misschien juist weinig gevoel op.",
      },
      {
        title: "Langzaam scannen",
        text: "Ga met je aandacht van je voeten via je benen en buik naar je schouders, handen en gezicht. Geef ieder gebied even aandacht, zonder te beoordelen.",
      },
      {
        title: "Het geheel voelen",
        text: "Voel je lichaam als één geheel. Spanning hoeft niet weg. Kijk alleen of je er één ademhaling lang wat ruimte omheen kunt laten ontstaan.",
      },
    ],
  },
  {
    id: "thoughts-as-clouds",
    title: "Gedachten laten komen en gaan",
    actionLabel: "Mindfulness: gedachten laten komen en gaan",
    duration: "ongeveer 3 minuten",
    summary: "Oefen om gedachten op te merken zonder er direct in mee te gaan.",
    steps: [
      {
        title: "Opmerken",
        text: "Neem even de tijd en merk op welke gedachte zich aandient. Je hoeft geen bijzondere gedachte te zoeken.",
      },
      {
        title: "Een gedachte benoemen",
        text: "Zeg in jezelf: ‘Ik merk de gedachte op dat …’ Vul je gedachte aan. Daarmee maak je een klein beetje ruimte tussen jou en wat je hoofd vertelt.",
      },
      {
        title: "Laten bewegen",
        text: "Stel je voor dat de gedachte als een wolk voorbijdrijft. Kom daarna terug bij één geluid, je ademhaling of het contact van je voeten met de vloer.",
      },
    ],
  },
] as const satisfies readonly [MindfulnessExercise, ...MindfulnessExercise[]];

export function isMindfulnessExerciseId(
  value: string,
): value is MindfulnessExerciseId {
  return mindfulnessExercises.some((exercise) => exercise.id === value);
}

type MindfulnessModuleProps = {
  exerciseId: MindfulnessExerciseId;
  onFinish: () => void;
  onBack: () => void;
};

export default function MindfulnessModule({
  exerciseId,
  onFinish,
  onBack,
}: MindfulnessModuleProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const exercise = useMemo(
    () =>
      mindfulnessExercises.find((item) => item.id === exerciseId) ??
      mindfulnessExercises[0],
    [exerciseId],
  );

  useEffect(() => {
    setStepIndex(0);
  }, [exerciseId]);

  const currentStep = exercise.steps[stepIndex] ?? exercise.steps[0];
  const isLastStep = stepIndex === exercise.steps.length - 1;
  const progress = Math.round(((stepIndex + 1) / exercise.steps.length) * 100);

  return (
    <div style={styles.module}>
      <div style={styles.headerRow}>
        <span style={styles.badge}>MINDFULNESS</span>
        <span style={styles.duration}>{exercise.duration}</span>
      </div>

      <h1 style={styles.title}>{exercise.title}</h1>
      <p style={styles.summary}>{exercise.summary}</p>

      <div style={styles.progressLabelRow}>
        <span>
          Stap {stepIndex + 1} van {exercise.steps.length}
        </span>
        <strong>{progress}%</strong>
      </div>
      <div
        style={styles.progressTrack}
        role="progressbar"
        aria-label="Voortgang mindfulnessoefening"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      <section style={styles.exerciseCard} aria-live="polite">
        <span style={styles.stepNumber}>{stepIndex + 1}</span>
        <div>
          <h2 style={styles.stepTitle}>{currentStep.title}</h2>
          <p style={styles.stepText}>{currentStep.text}</p>
        </div>
      </section>

      <p style={styles.safetyNote}>
        Kies een andere oefening of stop wanneer dit onprettig voelt. Deze
        korte oefening is geen vervanging voor behandeling of hulp bij een
        crisis.
      </p>

      <div style={styles.buttonRow}>
        {stepIndex > 0 && (
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => setStepIndex((current) => current - 1)}
          >
            Vorige
          </button>
        )}
        <button
          type="button"
          style={styles.primaryButton}
          onClick={() => {
            if (isLastStep) {
              onFinish();
              return;
            }
            setStepIndex((current) => current + 1);
          }}
        >
          {isLastStep ? "Oefening afronden" : "Volgende stap"}
        </button>
      </div>

      <button type="button" style={styles.backButton} onClick={onBack}>
        Terug naar mijn herstelplan
      </button>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  module: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    color: "#353151",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  badge: {
    borderRadius: "999px",
    background: "linear-gradient(135deg, #83d8c0, #b5e7d8)",
    color: "#245e51",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.6px",
    padding: "7px 10px",
  },
  duration: {
    color: "#756e8d",
    fontSize: "13px",
    fontWeight: 700,
  },
  title: {
    color: "#302b50",
    fontSize: "29px",
    lineHeight: 1.15,
    margin: 0,
  },
  summary: {
    color: "#655f7b",
    fontSize: "16px",
    lineHeight: 1.55,
    margin: 0,
  },
  progressLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#716a8a",
    fontSize: "12px",
  },
  progressTrack: {
    width: "100%",
    height: "8px",
    overflow: "hidden",
    borderRadius: "999px",
    backgroundColor: "#e9e4f7",
  },
  progressFill: {
    display: "block",
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #57bfa2, #7465dd)",
    transition: "width 180ms ease",
  },
  exerciseCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    border: "1.5px solid #d9d1f0",
    borderRadius: "22px",
    background: "linear-gradient(145deg, #f1fbf8, #f5f1ff)",
    padding: "20px",
    boxShadow: "0 10px 24px rgba(67, 57, 122, 0.09)",
  },
  stepNumber: {
    display: "grid",
    placeItems: "center",
    flex: "0 0 34px",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: "#625bdd",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 900,
  },
  stepTitle: {
    color: "#363057",
    fontSize: "19px",
    lineHeight: 1.25,
    margin: "3px 0 9px",
  },
  stepText: {
    color: "#514b69",
    fontSize: "16px",
    lineHeight: 1.65,
    margin: 0,
  },
  safetyNote: {
    borderLeft: "3px solid #ef9aaa",
    color: "#756e82",
    fontSize: "12px",
    lineHeight: 1.5,
    margin: 0,
    padding: "3px 0 3px 11px",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
  },
  primaryButton: {
    flex: 1,
    border: 0,
    borderRadius: "15px",
    background: "linear-gradient(135deg, #5757dd, #7a62e8)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 900,
    padding: "14px 16px",
  },
  secondaryButton: {
    border: "1.5px solid #625bdd",
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    color: "#554fc1",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 800,
    padding: "14px 16px",
  },
  backButton: {
    alignSelf: "center",
    border: 0,
    background: "transparent",
    color: "#5b54c3",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 800,
    padding: "8px",
  },
};
