"use client";
import { useEffect, useRef, useState } from "react";
import { createLocalId } from "./browserSupport";
import { actProgressByStage, type ActStage } from "./ActModule";
import { isMindfulnessExerciseId, type MindfulnessExerciseId } from "./MindfulnessModule";
import type { FlowEventType } from "./userFlow";
import { type ActionCategory, type ActionFrequency, type ActionRepeatMode, type ActionTiming, learningActionOptions, localDateKey, practiceActionOptions, type RecoveryAction, type RecoveryGoal } from "./recoveryModel";
import type { SignaleringsplanData } from "./SignaleringsplanModule";

// UI-drafts blijven lokaal; bevestigde doelen en acties worden via de
// RecoveryBuddy API aan de ingelogde (synthetische) patiënt gekoppeld.
export function useRecoveryPlan(navigate: (event: FlowEventType) => void, onPlanSaved: () => void) {
  const [pendingActionTemplate, setPendingActionTemplate] = useState<{ category: ActionCategory; value: string } | null>(null);
  const [goals, setGoals] = useState<RecoveryGoal[]>([]);
  const [quickGoalText, setQuickGoalText] = useState("");
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [goalDraft, setGoalDraft] = useState("");
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalPickerPurpose, setGoalPickerPurpose] = useState<"action" | "edit" | "template">("action");
  const activeGoal = goals.find(item => item.id === activeGoalId) ?? null;
  const goal = activeGoal?.text ?? "";
  const [actions, setActions] = useState<RecoveryAction[]>([]);
  const nextActionId = useRef(Date.now());
  const [newAction, setNewAction] = useState("");
  const [selectedActionCategory, setSelectedActionCategory] =
    useState<ActionCategory | null>(null);
  const [selectedActionTemplate, setSelectedActionTemplate] = useState("");
  const [actionRepeatMode, setActionRepeatMode] =
    useState<ActionRepeatMode>("once");
  const [actionFrequency, setActionFrequency] =
    useState<ActionFrequency>("daily");
  const [actionDate, setActionDate] = useState("");
  const [actionTime, setActionTime] = useState("");
  const [actionWeekday, setActionWeekday] = useState("monday");
  const [actionTiming, setActionTiming] = useState<ActionTiming>("later");
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);
  const [draftSupporter, setDraftSupporter] = useState("");
  const [draftSupportHow, setDraftSupportHow] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTitle, setCelebrationTitle] = useState("Goed gedaan!");
  const [celebrationText, setCelebrationText] = useState(
    "Je hebt een actie voltooid.",
  );
  const [actStage, setActStage] = useState<ActStage>("intro");
  const [actActionId, setActActionId] = useState<number | null>(null);
  const [actBarrier, setActBarrier] = useState("");
  const [actWillingness, setActWillingness] = useState("");
  const [actReadingProgress, setActReadingProgress] = useState(0);
  const [actDailyCompleted, setActDailyCompleted] = useState(false);
  const [mindfulnessActionId, setMindfulnessActionId] = useState<number | null>(
    null,
  );
  const [mindfulnessExerciseId, setMindfulnessExerciseId] =
    useState<MindfulnessExerciseId | null>(null);
  const [planHydrated, setPlanHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"loading" | "saving" | "saved" | "error">("loading");
  const persistTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/recovery-plan", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("PLAN_LOAD_FAILED");
        return response.json() as Promise<{ plan?: { goals?: RecoveryGoal[]; actions?: RecoveryAction[] } }>;
      })
      .then(({ plan }) => {
        if (!active) return;
        const loadedGoals = Array.isArray(plan?.goals) ? plan.goals : [];
        const loadedActions = Array.isArray(plan?.actions) ? plan.actions : [];
        setGoals(loadedGoals);
        setActions(loadedActions);
        setActiveGoalId(loadedGoals[0]?.id ?? null);
        nextActionId.current = Math.max(Date.now(), ...loadedActions.map((action) => Number(action.id) + 1));
        setPlanHydrated(true);
        setSyncStatus("saved");
        if (loadedGoals.length) {
          onPlanSaved();
          navigate("SKIP_ONBOARDING");
        }
      })
      .catch(() => {
        if (active) {
          setPlanHydrated(true);
          setSyncStatus("error");
        }
      });
    return () => { active = false; };
  }, [navigate, onPlanSaved]);

  useEffect(() => {
    if (!planHydrated) return;
    if (persistTimer.current !== null) window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      setSyncStatus("saving");
      void fetch("/api/recovery-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals, actions }),
      }).then((response) => {
        setSyncStatus(response.ok ? "saved" : "error");
      }).catch(() => setSyncStatus("error"));
    }, 350);
    return () => {
      if (persistTimer.current !== null) window.clearTimeout(persistTimer.current);
    };
  }, [actions, goals, planHydrated]);
  const openActions = actions.filter((action) => !action.completed);
  const activeGoalActions = actions.filter(action => action.goalId === activeGoalId);
  const selectedAction =
    actions.find((action) => action.id === selectedActionId) ?? null;
  const hasActModuleAction = activeGoalActions.some(
    (action) => action.kind === "actModule",
  );
  const actModuleAction = openActions.find(
    (action) => action.kind === "actModule",
  );
  const mindfulnessActions = openActions.filter(
    (action) => action.kind === "mindfulness",
  );
  const supportedActions = actions.filter((action) => action.support);
  const selectedActionText =
    selectedActionCategory === "practice"
      ? (practiceActionOptions.find(
        (option) => option.value === selectedActionTemplate,
      )?.label ?? "")
      : selectedActionCategory === "learn"
        ? (learningActionOptions.find(
          (option) => option.value === selectedActionTemplate,
        )?.label ?? "")
        : newAction.trim();
  const hasValidActionContent =
    selectedActionCategory === "contact"
      ? Boolean(newAction.trim())
      : Boolean(
        selectedActionCategory &&
        selectedActionTemplate &&
        !(
          selectedActionTemplate === "act-practice" &&
          hasActModuleAction
        ),
      );
  const hasValidActionSchedule =
    actionRepeatMode === "once" ||
    Boolean(
      actionTime &&
      (actionFrequency === "daily" ||
        (actionFrequency === "weekly" && actionWeekday)),
    );
  const canContinueToActionSupport =
    hasValidActionContent && hasValidActionSchedule;
  useEffect(() => {
    if (!showCelebration) return;

    const timer = window.setTimeout(() => {
      setShowCelebration(false);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [showCelebration]);

  function resetActionDraft() {
    setNewAction("");
    setSelectedActionCategory(null);
    setSelectedActionTemplate("");
    setActionRepeatMode("once");
    setActionFrequency("daily");
    setActionDate("");
    setActionTime("");
    setActionWeekday("monday");
    setActionTiming("later");
    setDraftSupporter("");
    setDraftSupportHow("");
  }

  function addGoalFromHome() {
    const text = quickGoalText.trim();
    if (!text) return;
    const id = createLocalId();
    setGoals(current => [...current, { id, text }]);
    setActiveGoalId(id);
    setQuickGoalText("");
    setSelectedActionId(null);
  }

  function startNewGoal() {
    setPendingActionTemplate(null);
    setEditingGoalId(null);
    setGoalDraft("");
    setSelectedActionId(null);
    navigate("OPEN_GOAL");
  }

  function editGoal(id: string) {
    setPendingActionTemplate(null);
    const existing = goals.find(item => item.id === id);
    if (!existing) return;
    setActiveGoalId(id);
    setEditingGoalId(id);
    setGoalDraft(existing.text);
    navigate("OPEN_GOAL");
  }

  function openGoalEditor() {
    if (!goals.length) { startNewGoal(); return; }
    if (goals.length === 1) { editGoal(goals[0].id); return; }
    setGoalPickerPurpose("edit");
    navigate("OPEN_GOAL_PICKER");
  }

  function saveGoal(addActions: boolean) {
    const text = goalDraft.trim();
    if (!text) return;
    const id = editingGoalId ?? createLocalId();
    setGoals(current => editingGoalId
      ? current.map(item => item.id === id ? { ...item, text } : item)
      : [...current, { id, text }]);
    setActiveGoalId(id);
    setEditingGoalId(id);
    setSelectedActionId(null);
    resetActionDraft();
    if (addActions && pendingActionTemplate) {
      applyActionTemplate(id, pendingActionTemplate);
      return;
    }
    setPendingActionTemplate(null);
    if (addActions) navigate("OPEN_ACTIONS");
    else { onPlanSaved(); navigate("GO_HOME"); }
  }

  function openActionCreator(goalId?: string) {
    setPendingActionTemplate(null);
    if (!goals.length) { startNewGoal(); return; }
    const target = goalId ?? (goals.length === 1 ? goals[0].id : null);
    if (!target || !goals.some(item => item.id === target)) {
      setGoalPickerPurpose("action");
      navigate("OPEN_GOAL_PICKER");
      return;
    }
    setActiveGoalId(target);
    setSelectedActionId(null);
    resetActionDraft();
    navigate("OPEN_ACTIONS");
  }

  function startTemplateGoal() {
    setEditingGoalId(null);
    setGoalDraft("");
    setSelectedActionId(null);
    navigate("OPEN_GOAL");
  }

  function applyActionTemplate(goalId: string, template: { category: ActionCategory; value: string }) {
    setActiveGoalId(goalId);
    setSelectedActionId(null);
    resetActionDraft();
    setSelectedActionCategory(template.category);
    if (template.category === "contact") setNewAction(template.value);
    else setSelectedActionTemplate(template.value);
    setPendingActionTemplate(null);
    navigate("OPEN_ACTION_SPECIFY");
  }

  function startActionTemplate(category: ActionCategory, value: string) {
    const template = { category, value };
    setPendingActionTemplate(template);
    if (!goals.length) { startTemplateGoal(); return; }
    if (goals.length === 1) { applyActionTemplate(goals[0].id, template); return; }
    setGoalPickerPurpose("template");
    navigate("OPEN_GOAL_PICKER");
  }

  function chooseTemplateGoal(goalId: string) {
    if (pendingActionTemplate && goals.some(goal => goal.id === goalId)) {
      applyActionTemplate(goalId, pendingActionTemplate);
    } else {
      openActionCreator(goalId);
    }
  }

  function openActionTypeChoice() {
    if (!activeGoal) { openActionCreator(); return; }
    resetActionDraft();
    navigate("OPEN_ACTION_SPECIFY");
  }

  function chooseActionCategory(category: ActionCategory) {
    setSelectedActionCategory(category);
    setActionTiming("later");
    setNewAction("");
    setSelectedActionTemplate("");
    setDraftSupporter("");
    setDraftSupportHow("");
  }

  function continueToActionSupport() {
    if (!selectedActionCategory || !canContinueToActionSupport) return;
    if (selectedActionCategory === "practice" && selectedActionTemplate === "exposure") {
      navigate("ACTION_SPECIFY_CONTINUE");
      return;
    }
    saveSelectedAction(false);
  }

  function createAction(withSupport: boolean, immediate = false): number | null {
    if (!activeGoal) return null;
    if (!selectedActionCategory || !canContinueToActionSupport) return null;
    if (withSupport && !draftSupporter.trim()) return null;
    if (selectedActionTemplate === "act-practice" && hasActModuleAction) return null;

    const isActModule = selectedActionTemplate === "act-practice";
    const isSignaleringsplan = selectedActionTemplate === "signaleringsplan";
    const mindfulnessTemplateId = selectedActionTemplate.startsWith(
      "mindfulness:",
    )
      ? selectedActionTemplate.slice("mindfulness:".length)
      : "";
    const mindfulnessExerciseId = isMindfulnessExerciseId(
      mindfulnessTemplateId,
    )
      ? mindfulnessTemplateId
      : undefined;
    const actionId = ++nextActionId.current;

    setActions((currentActions) => [
      ...currentActions,
      {
        id: actionId,
        goalId: activeGoal.id,
        text: selectedActionText,
        completed: false,
        kind: isActModule
          ? "actModule"
          : isSignaleringsplan
            ? "signalingPlan"
          : mindfulnessExerciseId
            ? "mindfulness"
            : "standard",
        category: selectedActionCategory,
        schedule: {
          repeatMode: actionRepeatMode,
          frequency:
            actionRepeatMode === "recurring" ? actionFrequency : undefined,
          date: actionRepeatMode === "once" ? actionDate || undefined : undefined,
          time: actionTime || undefined,
          weekday:
            actionRepeatMode === "recurring" && actionFrequency === "weekly"
              ? actionWeekday
              : undefined,
        },
        support: withSupport
          ? {
            name: draftSupporter.trim(),
            how: draftSupportHow.trim() || undefined,
          }
          : undefined,
        completionCount: 0,
        resourceUrl:
          selectedActionTemplate === "recovery-stories"
            ? "https://verhalenbankpsychiatrie.nl/verhalen-2/"
            : undefined,
        mindfulnessExerciseId,
      },
    ]);

    if (isActModule) {
      // De keuze voegt ACT als oefenactie toe. De module start pas wanneer
      // de gebruiker haar vanuit het dashboard opent.
      setActActionId(immediate ? actionId : null);
      setActStage("intro");
      setActBarrier("");
      setActWillingness("");
      setActReadingProgress(0);
      setActDailyCompleted(false);
    }

    resetActionDraft();
    return actionId;
  }

  function saveSelectedAction(withSupport: boolean) {
    const actionId = createAction(withSupport);
    if (actionId === null) return;
    navigate(
      withSupport ? "ACTION_SUPPORT_DETAILS_SAVE" : "ACTION_SUPPORT_NO",
    );
  }

  function startImmediateAction(): number | null {
    const actionId = createAction(false, true);
    if (actionId !== null) setSelectedActionId(actionId);
    return actionId;
  }

  function openSignaleringsplan(actionId: number) {
    const action = actions.find(item => item.id === actionId && item.kind === "signalingPlan");
    if (!action) return;
    setActiveGoalId(action.goalId);
    setSelectedActionId(actionId);
    navigate("OPEN_SIGNALING_PLAN");
  }

  function saveSignaleringsplan(actionId: number, plan: SignaleringsplanData) {
    setActions(current => current.map(action => action.id === actionId
      ? { ...action, signaleringsplan: plan }
      : action));
  }

  function completeSelectedAction() {
    if (!selectedAction) return;

    const isRecurring = selectedAction.schedule.repeatMode === "recurring";
    const actionId = selectedAction.id;

    setActions((currentActions) =>
      currentActions.map((action) => {
        if (action.id !== actionId) return action;

        return {
          ...action,
          completed: isRecurring ? false : true,
          completionCount: action.completionCount + 1,
          lastCompletedOn: localDateKey(),
        };
      }),
    );
    setSelectedActionId(null);
    setCelebrationTitle("Goed gedaan!");
    setCelebrationText(
      isRecurring
        ? "Je hebt deze herhaling afgerond. De actie blijft in je planning staan."
        : "Je hebt een actie voltooid.",
    );
    setShowCelebration(true);
  }

  function removeAction(actionId: number) {
    setActions((currentActions) =>
      currentActions.filter((action) => action.id !== actionId),
    );

    if (actActionId === actionId) {
      setActActionId(null);
      setActStage("intro");
      setActBarrier("");
      setActWillingness("");
      setActReadingProgress(0);
      setActDailyCompleted(false);
    }

    if (mindfulnessActionId === actionId) {
      setMindfulnessActionId(null);
      setMindfulnessExerciseId(null);
    }
  }

  function openMindfulnessExercise(
    exerciseId: MindfulnessExerciseId,
    actionId: number | null = null,
  ) {
    setMindfulnessExerciseId(exerciseId);
    setMindfulnessActionId(actionId);
    setSelectedActionId(null);
    navigate("OPEN_MINDFULNESS_EXERCISE");
  }

  function finishMindfulnessExercise() {
    const linkedAction =
      mindfulnessActionId === null
        ? null
        : actions.find((action) => action.id === mindfulnessActionId) ?? null;

    if (linkedAction) {
      const isRecurring = linkedAction.schedule.repeatMode === "recurring";

      setActions((currentActions) =>
        currentActions.map((action) =>
          action.id === linkedAction.id
            ? {
              ...action,
              completed: isRecurring ? false : true,
              completionCount: action.completionCount + 1,
              lastCompletedOn: localDateKey(),
            }
            : action,
        ),
      );

      setCelebrationText(
        isRecurring
          ? "Je mindfulnessoefening voor vandaag is afgerond. De actie blijft in je planning staan."
          : "Je mindfulnessoefening en de gekoppelde actie zijn afgerond.",
      );
    } else {
      setCelebrationText("Je hebt een korte mindfulnessoefening afgerond.");
    }

    setCelebrationTitle("Mooi aandachtig geoefend!");
    setShowCelebration(true);
    setMindfulnessActionId(null);
    navigate("FINISH_MINDFULNESS_EXERCISE");
  }

  function updateActState(actionId: number, patch: Partial<NonNullable<RecoveryAction["actState"]>>) {
    setActions(current => current.map(action => action.id === actionId ? {
      ...action,
      actState: { stage: "intro", progress: 0, barrier: "", willingness: "", ...action.actState, ...patch },
    } : action));
  }

  function loadActAction(actionId: number, stage: ActStage) {
    const action = actions.find(item => item.id === actionId && item.kind === "actModule");
    if (!action) return;
    setActiveGoalId(action.goalId);
    setActActionId(actionId);
    setSelectedActionId(null);
    setActStage(stage);
    const progress = Math.max(action.actState?.progress ?? 0, actProgressByStage[stage]);
    setActReadingProgress(progress);
    setActBarrier(action.actState?.barrier ?? "");
    setActWillingness(action.actState?.willingness ?? "");
    setActDailyCompleted(action.actState?.lastCompletedOn === localDateKey());
    updateActState(actionId, { stage, progress });
    navigate("OPEN_ACT_MODULE");
  }

  function openActReading(actionId: number) {
    loadActAction(actionId, "intro");
  }

  function changeActStage(nextStage: ActStage) {
    const progress = Math.max(actReadingProgress, actProgressByStage[nextStage]);
    setActStage(nextStage);
    setActReadingProgress(progress);
    if (actActionId !== null) updateActState(actActionId, { stage: nextStage, progress });
  }

  function openActDailyAction(actionId: number) {
    loadActAction(actionId, "exercise");
  }

  function finishActDailyAction() {
    if (actActionId !== null) updateActState(actActionId, { lastCompletedOn: localDateKey() });
    setActDailyCompleted(true);
    setActStage("exercise");
    setSelectedActionId(null);
    setCelebrationTitle("Mooi gedaan!");
    setCelebrationText("Je hebt je dagelijkse ACT-actie afgerond.");
    setShowCelebration(true);
    navigate("FINISH_ACT_DAILY_ACTION");
  }


  return {
    pendingActionTemplate, startActionTemplate, chooseTemplateGoal, startTemplateGoal,
    goals,
    quickGoalText,
    setQuickGoalText,
    activeGoalId,
    setActiveGoalId,
    goalDraft,
    setGoalDraft,
    editingGoalId,
    setEditingGoalId,
    goalPickerPurpose,
    setGoalPickerPurpose,
    actions,
    newAction,
    setNewAction,
    selectedActionCategory,
    setSelectedActionCategory,
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
    setShowCelebration,
    celebrationTitle,
    setCelebrationTitle,
    celebrationText,
    setCelebrationText,
    actStage,
    setActStage,
    actActionId,
    setActActionId,
    actBarrier,
    setActBarrier,
    actWillingness,
    setActWillingness,
    actReadingProgress,
    setActReadingProgress,
    actDailyCompleted,
    setActDailyCompleted,
    mindfulnessActionId,
    setMindfulnessActionId,
    mindfulnessExerciseId,
    syncStatus,
    setMindfulnessExerciseId,
    activeGoal,
    goal,
    openActions,
    activeGoalActions,
    selectedAction,
    hasActModuleAction,
    actModuleAction,
    mindfulnessActions,
    supportedActions,
    selectedActionText,
    hasValidActionContent,
    hasValidActionSchedule,
    canContinueToActionSupport,
    resetActionDraft,
    addGoalFromHome,
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
    loadActAction,
    openActReading,
    changeActStage,
    openActDailyAction,
    finishActDailyAction
  };
}

export type RecoveryPlan = ReturnType<typeof useRecoveryPlan>;
