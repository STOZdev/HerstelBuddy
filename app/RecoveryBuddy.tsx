"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  classifyBuddyLocally,
  getBuddyFastInterpretation,
  inferBuddyTopic,
  isBuddyInterpretation,
  resolveBuddyRoute,
  type BuddyActionType,
  type BuddyClarificationType,
  type BuddyContext,
  type BuddyFallbackReason,
  type BuddyInterpretation,
  type BuddyInterpretationSource,
} from "./BuddyLibrary";
import { buddyLanguageMapping, findLanguageMappings, matchMappingOption, type LanguageMapping, type MappingOption } from "./BuddyLanguageMapping";
import { interpretBuddyMessage } from "./RecoveryBuddyLLM";
import { readCheckInPlanOptions } from "./SignaleringsplanModule";

type MoodScore = 1 | 2 | 3 | 4;

type BuddyAction =
  | "smallStep"
  | "support"
  | "act"
  | "reflect"
  | "goal"
  | "finish"
  | "openAct"
  | "openActions"
  | "addAction"
  | "editGoal"
  | "safetyHelp"
  | "safetySafe"
  | "call112"
  | "open113"
  | "openStories"
  | "planStep"
  | "openSignaleringsplan"
  | "openLearning"
  | "openPractice"
  | "openMatchedAction"
  | "mappingTopic"
  | "mappingAnswer"
  | "mappingOther";

type BuddyActionSummary = {
  id: string | number;
  title: string;
  actionType: Exclude<BuddyActionType, "NONE">;
};

type BuddyChoice = {
  label: string;
  action: BuddyAction;
  actionId?: string;
  mappingId?: string;
  optionId?: string;
};

type BuddyMessage = {
  id: number;
  sender: "buddy" | "user";
  text: string;
};

type MoodRule = {
  label: string;
  emoji: string;
  color: string;
  background: string;
  response: string;
  choices: BuddyChoice[];
};

type RecoveryBuddyProps = {
  onOpenSignaleringsplan?: () => void;
  onOpenLearning?: () => void;
  onOpenPractice?: () => void;
  onOpenAction?: (actionId: string) => void;
  onSuggestPsychoeducation?: (text: string, topic?: string) => Promise<boolean>;
  onClearPsychoeducation?: () => void;
  active: boolean;
  forceCollapsed?: boolean;
  highlighted?: boolean;
  goal: string;
  openActionCount: number;
  openActions?: BuddyActionSummary[];
  currentScreen?: string;
  selectedActionId?: string | number | null;
  hasActModule: boolean;
  onOpenGoal: () => void;
  onAddAction: () => void;
  onOpenActDaily: () => void;
};

const moodRules: Record<MoodScore, MoodRule> = {
  1: {
    label: "Lachend",
    emoji: "🙂",
    color: "#18855b",
    background: "#ebfaef",
    response:
      "Fijn om te horen. Misschien is dit een goed moment voor iets dat jouw herstel ondersteunt. Wat spreekt je aan?",
    choices: [
      { label: "Een actie oppakken", action: "smallStep" },
      { label: "Mijn dagelijkse oefening", action: "act" },
      { label: "Vasthouden wat helpt", action: "reflect" },
    ],
  },
  2: {
    label: "Neutraal",
    emoji: "😐",
    color: "#a87a00",
    background: "#fffbe5",
    response:
      "Dankjewel. Het klinkt alsof het vandaag een beetje gemengd is. Wat zou deze dag één klein stapje beter kunnen maken?",
    choices: [
      { label: "Een actie kiezen", action: "smallStep" },
      { label: "Mijn hersteldoel bekijken", action: "goal" },
      { label: "Even stilstaan bij wat helpt", action: "reflect" },
    ],
  },
  3: {
    label: "Verdrietig",
    emoji: "🙁",
    color: "#d66a00",
    background: "#fff4e8",
    response:
      "Dat klinkt als een lastige dag. We hoeven het niet meteen op te lossen. Welke kleine vorm van steun past nu het beste?",
    choices: [
      { label: "Iemand om steun vragen", action: "support" },
      { label: "Een kleine stap kiezen", action: "smallStep" },
      { label: "Een rustige oefening", action: "act" },
    ],
  },
  4: {
    label: "Wanhopig",
    emoji: "😟",
    color: "#b4232f",
    background: "#fff0f1",
    response:
      "Dat klinkt heel zwaar. Je hoeft dit niet alleen te dragen. Ben je nu in direct gevaar of kun je jezelf niet veilig houden? Bel dan 112. Neem anders contact op met je behandelaar, huisarts of iemand die je vertrouwt. Wat is nu haalbaar?",
    choices: [
      { label: "Iemand om steun vragen", action: "support" },
      { label: "Een heel kleine stap", action: "smallStep" },
      { label: "Een rustige oefening", action: "act" },
    ],
  },
};

const initialMessage: BuddyMessage = {
  id: 1,
  sender: "buddy",
  text:
    "Hoi, ik ben je herstelbuddy. Hoe voel je je op dit moment? Je kunt een smiley kiezen of het in je eigen woorden vertellen.",
};

// Ook een trage/onbereikbare Next.js-server mag de invoer niet onbeperkt blokkeren.
async function interpretWithDeadline(request: Parameters<typeof interpretBuddyMessage>[0]) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      interpretBuddyMessage(request),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          const error = new Error("Interpretation timeout");
          error.name = "TimeoutError";
          reject(error);
        }, 10000);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export default function RecoveryBuddy({
  onOpenSignaleringsplan,
  onOpenLearning,
  onOpenPractice,
  onOpenAction,
  onSuggestPsychoeducation,
  onClearPsychoeducation,
  active,
  forceCollapsed = false,
  highlighted = false,
  goal,
  openActionCount,
  openActions = [],
  currentScreen = "dashboard",
  selectedActionId = null,
  hasActModule,
  onOpenGoal,
  onAddAction,
  onOpenActDaily,
}: RecoveryBuddyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mood, setMood] = useState<MoodScore | null>(null);
  const [messages, setMessages] = useState<BuddyMessage[]>([initialMessage]);
  const [choices, setChoices] = useState<BuddyChoice[]>([]);
  const [draftText, setDraftText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [interpretationSource, setInterpretationSource] =
    useState<BuddyInterpretationSource | null>(null);
  const [fallbackReason, setFallbackReason] =
    useState<BuddyFallbackReason>("NONE");
  const pendingMappingId = useRef<string | null>(null);
  const submissionBusy = useRef(false);
  const interactionVersion = useRef(0);
  const messagesEndRef = useRef<HTMLSpanElement | null>(null);
  const showPanel = isOpen && !forceCollapsed;
  const selectedActionIdText =
    selectedActionId === null ? "" : String(selectedActionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [isThinking, messages]);

  useEffect(() => {
    if (!active) interactionVersion.current += 1;
    return () => { interactionVersion.current += 1; };
  }, [active]);

  if (!active) return null;

  function appendMessage(sender: BuddyMessage["sender"], text: string) {
    setMessages((current) => [
      ...current,
      { id: Date.now() + Math.random(), sender, text },
    ]);
  }

  function chooseMood(score: MoodScore) {
    pendingMappingId.current = null;
    interactionVersion.current += 1;
    onClearPsychoeducation?.();
    const rule = moodRules[score];
    let availableChoices = rule.choices.filter(
      (choice) => choice.action !== "act" || hasActModule,
    );
    let response = rule.response;
    try {
      const { label, options } = readCheckInPlanOptions(score);
      response += options.length
        ? `\n\nIn jouw signaleringsplan staan voor de ${label} fase deze afspraken. Welke past nu?`
        : `\n\nJe hebt nog geen acties of steunafspraken voor de ${label} fase ingevuld. Wil je je signaleringsplan aanvullen?`;
      if (options.length) {
        availableChoices = options.map(label => ({ label, action: "planStep" as const }));
        if (score === 4) availableChoices.push({ label: "Iemand om steun vragen", action: "support" });
      }
    } catch {
      response += "\n\nJe signaleringsplan kon niet worden gelezen. Je kunt het via de onderste balk openen.";
    }
    if (onOpenSignaleringsplan) availableChoices.push({ label: "Mijn signaleringsplan openen", action: "openSignaleringsplan" });

    setMood(score);
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: "user",
        text: `${rule.emoji} ${rule.label}`,
      },
      {
        id: Date.now() + 1,
        sender: "buddy",
        text: response,
      },
    ]);
    setChoices(availableChoices);
  }

  function finishCheckIn() {
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: "buddy",
        text: "Goed dat je even hebt ingecheckt. Houd het klein en kies wat vandaag bij je past. Ik ben hier als je later opnieuw wilt inchecken.",
      },
    ]);
    setChoices([]);
  }

  function showUrgentSafetyResponse() {
    onClearPsychoeducation?.();
    appendMessage(
      "buddy",
      "Het klinkt alsof je misschien niet veilig bent. Ben je nu in direct gevaar of kun je jezelf niet veilig houden? Bel dan 112. Geen direct levensgevaar, maar wel hulp nodig of gedachten aan zelfdoding? Bel 113 of chat via 113.nl. Probeer ook je behandelaar, huisarts of iemand die je vertrouwt in te schakelen.",
    );
    setChoices([
      { label: "Bel 112", action: "call112" },
      { label: "Open 113.nl", action: "open113" },
      { label: "Iemand inschakelen", action: "support" },
    ]);
  }

  function showClarification(type: BuddyClarificationType) {
    if (type === "CREATE_OR_COMPLETE_ACTION") {
      appendMessage(
        "buddy",
        "Bedoel je dat je een nieuwe actie wilt toevoegen, of dat je een bestaande actie hebt afgerond?",
      );
      setChoices([
        { label: "Nieuwe actie toevoegen", action: "addAction" },
        { label: "Bestaande actie afronden", action: "openActions" },
      ]);
      return;
    }

    if (type === "GOAL_OR_ACTION") {
      appendMessage(
        "buddy",
        "Gaat dit over je hersteldoel of over één van je acties?",
      );
      setChoices([
        { label: "Mijn hersteldoel", action: "goal" },
        { label: "Mijn acties", action: "smallStep" },
      ]);
      return;
    }

    if (type === "ACT_OR_OTHER_ACTION") {
      appendMessage(
        "buddy",
        "Bedoel je de dagelijkse ACT-oefening, of een andere herstelactie?",
      );
      setChoices([
        ...(hasActModule
          ? ([{ label: "Mijn ACT-oefening", action: "act" }] as BuddyChoice[])
          : []),
        { label: "Een andere actie", action: "smallStep" },
      ]);
      return;
    }

    if (type === "CONTACT_OR_ACTION") {
      appendMessage(
        "buddy",
        "Wil je nu iemand om steun vragen, of wil je hiervan een contactactie maken?",
      );
      setChoices([
        { label: "Nu iemand om steun vragen", action: "support" },
        { label: "Contactactie toevoegen", action: "addAction" },
      ]);
      return;
    }

    appendMessage(
      "buddy",
      "Dank je. Ik kan nog niet betrouwbaar bepalen wat je wilt doen. Waar gaat je bericht vooral over?",
    );
    setChoices([
      { label: "Mijn acties", action: "smallStep" },
      { label: "Mijn hersteldoel", action: "goal" },
      { label: "Iemand om steun vragen", action: "support" },
      ...(hasActModule
        ? ([{ label: "Mijn ACT-oefening", action: "act" }] as BuddyChoice[])
        : []),
    ]);
  }

  function handleInterpretation(interpretation: BuddyInterpretation) {
    const route = resolveBuddyRoute(interpretation);

    if (route === "SAFETY_URGENT") {
      showUrgentSafetyResponse();
      return;
    }

    if (route === "SAFETY_CHECK") {
      appendMessage(
        "buddy",
        "Ik wil dit goed begrijpen en vraag het daarom rechtstreeks: denk je er nu aan jezelf iets aan te doen of een einde aan je leven te maken?",
      );
      setChoices([
        { label: "Ja of misschien", action: "safetyHelp" },
        { label: "Nee, ik ben nu veilig", action: "safetySafe" },
      ]);
      return;
    }

    if (route === "CLARIFY") {
      showClarification(interpretation.clarificationType);
      return;
    }

    if (route === "CREATE_ACTION") {
      appendMessage(
        "buddy",
        "Je wilt een nieuwe herstelactie toevoegen. Je kunt kiezen voor leren, oefenen of contact en eventueel een planning instellen.",
      );
      setChoices([
        { label: "Actie toevoegen", action: "addAction" },
        { label: "Nu niet", action: "finish" },
      ]);
      return;
    }

    if (route === "COMPLETE_ACTION") {
      const referencedAction = openActions.find(
        (action) => String(action.id) === interpretation.referencedActionId,
      );

      appendMessage(
        "buddy",
        openActionCount > 0
          ? referencedAction
            ? `Ik denk dat je “${referencedAction.title}” hebt afgerond. Controleer de selectie op het dashboard en kies daarna ‘Voltooien’.`
            : "Goed bezig. Selecteer de afgeronde actie op het dashboard en kies daarna ‘Voltooien’."
          : "Ik zie momenteel geen openstaande actie om te voltooien.",
      );
      setChoices(
        openActionCount > 0
          ? [
              { label: "Bekijk mijn acties", action: "openActions" },
              { label: "Nu niet", action: "finish" },
            ]
          : [{ label: "Actie toevoegen", action: "addAction" }],
      );
      return;
    }

    if (route === "OPEN_ACTIONS") {
      appendMessage(
        "buddy",
        openActionCount > 0
          ? `Je hebt ${openActionCount} ${
              openActionCount === 1 ? "openstaande actie" : "openstaande acties"
            }. Je kunt ze op het dashboard bekijken.`
          : "Je hebt nog geen openstaande acties. Wil je er één toevoegen?",
      );
      setChoices(
        openActionCount > 0
          ? [{ label: "Bekijk mijn acties", action: "openActions" }]
          : [{ label: "Actie toevoegen", action: "addAction" }],
      );
      return;
    }

    if (route === "OPEN_GOAL") {
      appendMessage(
        "buddy",
        goal.trim()
          ? `Jouw hersteldoel is: “${goal}”. Wil je het bekijken of aanpassen?`
          : "Je hebt nog geen hersteldoel toegevoegd. Wil je daar nu mee beginnen?",
      );
      setChoices([
        {
          label: goal.trim() ? "Open mijn hersteldoel" : "Hersteldoel toevoegen",
          action: "editGoal",
        },
        { label: "Nu niet", action: "finish" },
      ]);
      return;
    }

    if (route === "OPEN_ACT_DAILY") {
      appendMessage(
        "buddy",
        hasActModule
          ? "Je ACT-oefenactie staat klaar. Je kunt de dagelijkse oefening openen."
          : "Je hebt nog geen ACT-oefenactie. Voeg een nieuwe actie toe en kies onder ‘Oefenen’ voor ACT.",
      );
      setChoices(
        hasActModule
          ? [
              { label: "Start dagelijkse oefening", action: "openAct" },
              { label: "Nu niet", action: "finish" },
            ]
          : [
              { label: "ACT-actie toevoegen", action: "addAction" },
              { label: "Nu niet", action: "finish" },
            ],
      );
      return;
    }

    if (route === "OPEN_RECOVERY_STORIES") {
      appendMessage(
        "buddy",
        "Wil je lezen over het herstel van anderen? Ik kan de Verhalenbank Psychiatrie voor je openen.",
      );
      setChoices([
        { label: "Herstelverhalen openen", action: "openStories" },
        { label: "Nu niet", action: "finish" },
      ]);
      return;
    }

    if (route === "SEEK_SUPPORT") {
      appendMessage(
        "buddy",
        "Het kan helpen om één persoon te kiezen bij wie je je voldoende veilig voelt. Zal ik je helpen de stap klein te maken?",
      );
      setChoices([
        { label: "Iemand om steun vragen", action: "support" },
        { label: "Contactactie toevoegen", action: "addAction" },
        { label: "Nu niet", action: "finish" },
      ]);
      return;
    }

    if (route === "PLAN_ACTION") {
      appendMessage(
        "buddy",
        "Laten we het klein houden. Je kunt een bestaande actie kiezen of een nieuwe, haalbare stap toevoegen.",
      );
      setChoices(
        openActionCount > 0
          ? [
              { label: "Bekijk mijn acties", action: "openActions" },
              { label: "Nieuwe actie toevoegen", action: "addAction" },
            ]
          : [{ label: "Actie toevoegen", action: "addAction" }],
      );
      return;
    }

    if (route === "REFLECT") {
      appendMessage(
        "buddy",
        "Waar wil je bij stilstaan: wat hielp, wat moeilijk was, of wat je een volgende keer wilt proberen?",
      );
      setChoices([
        { label: "Contact met iemand", action: "finish" },
        { label: "Een activiteit", action: "finish" },
        { label: "Rust of ruimte", action: "finish" },
        { label: "Iets anders", action: "finish" },
      ]);
      return;
    }

    if (route === "SHARE_FEELING") {
      appendMessage(
        "buddy",
        "Dank je dat je dit vertelt. We hoeven het niet meteen op te lossen. Wat zou nu het meest passend zijn?",
      );
      setChoices([
        { label: "Iemand om steun vragen", action: "support" },
        { label: "Een kleine stap kiezen", action: "smallStep" },
        ...(hasActModule
          ? ([{ label: "Een rustige oefening", action: "act" }] as BuddyChoice[])
          : []),
      ]);
      return;
    }

    if (route === "SHOW_DASHBOARD") {
      appendMessage(
        "buddy",
        "Je bent al op je hersteloverzicht. Hier zie je je doel, acties en beschikbare hulpmiddelen.",
      );
      setChoices([{ label: "Begrepen", action: "finish" }]);
      return;
    }

    if (route === "SHOW_INFORMATION") {
      appendMessage(
        "buddy",
        "Ik kan je vooral helpen navigeren naar informatie, oefeningen en contact. Waar wil je meer over weten?",
      );
      setChoices([
        { label: "Herstelverhalen", action: "openStories" },
        ...(hasActModule
          ? ([{ label: "Mijn ACT-oefening", action: "act" }] as BuddyChoice[])
          : []),
        { label: "Mijn hersteldoel", action: "goal" },
      ]);
      return;
    }

    showClarification("GENERAL");
  }

  function showMappingQuestion(mapping: LanguageMapping) {
    pendingMappingId.current = mapping.id;
    appendMessage("buddy", mapping.question + "\n" + mapping.options.map(option => `${option.id}. ${option.label}`).join("\n") + "\nJe kunt kiezen of het in je eigen woorden vertellen.");
    setChoices([
      ...mapping.options.map(option => ({ label: option.label, action: "mappingAnswer" as const, mappingId: mapping.id, optionId: option.id })),
      { label: "Anders / ik weet het niet", action: "mappingOther" },
    ]);
  }

  function applyMappingAnswer(mapping: LanguageMapping, option: MappingOption) {
    pendingMappingId.current = null;
    appendMessage("buddy", option.suggestion);
    const options: BuddyChoice[] = option.actions.flatMap((action): BuddyChoice[] => {
      if (action === "learn") return [{ label: "Zoek passende uitleg", action: "openLearning" as const }];
      if (action === "practice" && onOpenPractice) return [{ label: "Kies een passende oefening", action: "openPractice" as const }];
      if (action === "contact") return [{ label: "Steun of contact voorbereiden", action: "support" as const }];
      if (action === "plan") return [{ label: "Een kleine actie plannen", action: "addAction" as const }];
      if (action === "signal" && onOpenSignaleringsplan) return [{ label: "Mijn signaleringsplan", action: "openSignaleringsplan" as const }];
      if (action === "urgent") return [{ label: "112 bellen bij direct gevaar", action: "call112" as const }];
      if (action === "actions") return [{ label: "Bekijk mijn acties", action: "openActions" as const }];
      return [];
    });
    setChoices(options);
    const version = interactionVersion.current;
    if (option.actions.includes("learn")) {
      void onSuggestPsychoeducation?.(option.topic, option.topic).then(found => {
        if (!found || version !== interactionVersion.current) return;
        setChoices(previous => previous.map(choice => choice.action === "openLearning" ? { ...choice, label: "Bekijk passende uitleg" } : choice));
      }).catch(() => {});
    }
  }

  function handleWithPsychoeducation(interpretation: BuddyInterpretation, text: string, version: number) {
    if (version !== interactionVersion.current) return;
    const route = resolveBuddyRoute(interpretation);
    if (interpretation.safety !== "NONE" || route === "SAFETY_URGENT" || route === "SAFETY_CHECK") {
      onClearPsychoeducation?.();
      pendingMappingId.current = null;
      handleInterpretation(interpretation);
      return;
    }
    const pending = buddyLanguageMapping.find(item => item.id === pendingMappingId.current);
    if (pending) {
      const answer = matchMappingOption(pending, text) ?? (interpretation.mappingId === pending.id && interpretation.confidence >= 0.75 && !interpretation.needsClarification ? pending.options.find(option => option.id === interpretation.mappingOptionId) : undefined);
      if (answer) { applyMappingAnswer(pending, answer); return; }
    }
    if (["SHARE_FEELING", "PLAN_ACTION", "SHOW_INFORMATION", "CLARIFY"].includes(route)) {
      const candidates = findLanguageMappings(text);
      const semantic = buddyLanguageMapping.find(item => item.id === interpretation.mappingId);
      if (!candidates.length && semantic) candidates.push(semantic);
      if (candidates.length > 1) {
        pendingMappingId.current = null;
        appendMessage("buddy", "Ik hoor meerdere mogelijke onderwerpen. Waar wil je eerst bij stilstaan?");
        setChoices([...candidates.map(item => ({ label: item.title, action: "mappingTopic" as const, mappingId: item.id })), { label: "Anders / ik weet het niet", action: "mappingOther" }]);
        return;
      }
      if (candidates.length === 1 && candidates[0].id !== pending?.id) { showMappingQuestion(candidates[0]); return; }
      if (pending && (!candidates.length || candidates[0].id === pending.id)) {
        appendMessage("buddy", "Ik weet nog niet welke optie je bedoelt. Kies gerust een antwoord hierboven, of geef aan dat iets anders speelt.");
        setChoices([...pending.options.map(option => ({ label: option.label, action: "mappingAnswer" as const, mappingId: pending.id, optionId: option.id })), { label: "Anders / ik weet het niet", action: "mappingOther" }]);
        return;
      }
    }
    pendingMappingId.current = null;
    handleInterpretation(interpretation);
    const topic = interpretation.topic || inferBuddyTopic(text);
    if (route !== "CLARIFY") {
      const matched = openActions.find(action => String(action.id) === interpretation.referencedActionId);
      const extra: BuddyChoice[] = [];
      if (matched && onOpenAction) extra.push({ label: `Bekijk: ${matched.title}`, action: "openMatchedAction", actionId: String(matched.id) });
      if (interpretation.actionType === "PRACTICE" && onOpenPractice && route !== "OPEN_ACT_DAILY") extra.push({ label: "Kies een oefening", action: "openPractice" });
      if (interpretation.actionType === "LEARN" || route === "SHOW_INFORMATION") extra.push({ label: "Zoek passende uitleg", action: "openLearning" });
      if (extra.length) setChoices(previous => [...extra, ...previous.filter(c => !extra.some(item => item.action === c.action))]);
    }
    // Zoek alleen inhoud bij een onderwerp/informatievraag, niet na elke navigatieopdracht.
    if (!topic && !["SHOW_INFORMATION", "SHARE_FEELING", "PLAN_ACTION"].includes(route)) return;
    void onSuggestPsychoeducation?.(text, topic).then(found => {
      if (version !== interactionVersion.current) return;
      if (found) {
        appendMessage("buddy", "Ik heb mogelijk passende psychoeducatie gevonden. Wil je die bekijken?");
        setChoices(previous => [...previous.filter(c => c.action !== "openLearning"), { label: "Bekijk passende psychoeducatie", action: "openLearning" }]);
      }
    }).catch(() => { /* Zoeken blokkeert het antwoord niet. */ });
  }

  async function handleFreeTextSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draftText.trim();
    if (!text || submissionBusy.current) return;
    submissionBusy.current = true;
    const version = ++interactionVersion.current;

    onClearPsychoeducation?.();
    appendMessage("user", text);
    setDraftText("");
    setChoices([]);
    setIsThinking(true);

    const buddyContext: BuddyContext = {
      pendingMappingId: pendingMappingId.current ?? "",
      currentScreen,
      hasGoal: Boolean(goal.trim()),
      openActionCount,
      openActions: openActions.slice(0, 20).map((action) => ({
        id: String(action.id),
        title: action.title,
        actionType: action.actionType,
      })),
      selectedActionId: selectedActionIdText,
      hasActModule,
      recentMessages: [
        ...messages.map((message) => ({
          role: message.sender,
          text: message.text,
        })),
        { role: "user" as const, text },
      ].slice(-6),
    };
    const localInterpretation = classifyBuddyLocally(text, buddyContext);

    if (localInterpretation.safety !== "NONE") {
      pendingMappingId.current = null;
      setInterpretationSource("local-safety");
      setFallbackReason("NONE");
      setIsThinking(false);
      submissionBusy.current = false;
      handleInterpretation(localInterpretation);
      return;
    }

    const pendingQuestion = buddyLanguageMapping.find(item => item.id === pendingMappingId.current);
    const exactAnswer = pendingQuestion ? matchMappingOption(pendingQuestion, text) : undefined;
    if (pendingQuestion && exactAnswer) {
      setInterpretationSource("local-rule");
      setFallbackReason("NONE");
      applyMappingAnswer(pendingQuestion, exactAnswer);
      submissionBusy.current = false;
      setIsThinking(false);
      return;
    }

    try {
      const fast = getBuddyFastInterpretation(text, buddyContext);
      const payload = fast
        ? { interpretation: fast, source: "local-rule" as const, fallbackReason: "NONE" as const }
        : await interpretWithDeadline({ message: text, context: buddyContext });
      if (version !== interactionVersion.current) return;

      setInterpretationSource(payload.source);
      setFallbackReason(payload.fallbackReason);
      console.info("Herstelbuddy interpretatie", {
        source: payload.source,
        fallbackReason: payload.fallbackReason,
        primaryIntent: payload.interpretation.primaryIntent,
        topic: payload.interpretation.topic,
        safety: payload.interpretation.safety,
        target: payload.interpretation.target,
        confidence: payload.interpretation.confidence,
      });

      handleWithPsychoeducation(
        isBuddyInterpretation(payload.interpretation)
          ? payload.interpretation
          : localInterpretation,
        text,
        version,
      );
    } catch (error) {
      if (version !== interactionVersion.current) return;
      setInterpretationSource("local-fallback");
      setFallbackReason(error instanceof Error && error.name === "TimeoutError" ? "MODEL_TIMEOUT" : "MODEL_ERROR");
      console.error(
        "Herstelbuddy kon de serveractie niet bereiken.",
        error instanceof Error ? error.message : "Onbekende fout",
      );
      handleWithPsychoeducation(localInterpretation, text, version);
    } finally {
      submissionBusy.current = false;
      setIsThinking(false);
    }
  }

  function handleChoice(choice: BuddyChoice) {
    interactionVersion.current += 1;
    if (choice.action !== "openLearning") onClearPsychoeducation?.();
    if (choice.action === "mappingTopic") {
      const mapping = buddyLanguageMapping.find(item => item.id === choice.mappingId);
      if (mapping) { appendMessage("user", choice.label); showMappingQuestion(mapping); }
      return;
    }
    if (choice.action === "mappingAnswer") {
      const mapping = buddyLanguageMapping.find(item => item.id === choice.mappingId);
      const option = mapping?.options.find(item => item.id === choice.optionId);
      if (mapping && option) { appendMessage("user", choice.label); applyMappingAnswer(mapping, option); }
      return;
    }
    pendingMappingId.current = null;
    if (choice.action === "mappingOther") {
      appendMessage("user", choice.label);
      appendMessage("buddy", "Dat is ook goed. Wil je vooral iets beter begrijpen, een kleine stap kiezen of iemand spreken? Je kunt ook verder vertellen.");
      setChoices([{ label: "Iets begrijpen", action: "openLearning" }, { label: "Een kleine stap", action: "smallStep" }, { label: "Iemand spreken", action: "support" }]);
      return;
    }
    if (choice.action === "openMatchedAction" && choice.actionId) {
      if (openActions.some(action => String(action.id) === choice.actionId)) {
        setIsOpen(false);
        onOpenAction?.(choice.actionId);
      }
      return;
    }
    if (choice.action === "openPractice") {
      setIsOpen(false);
      onOpenPractice?.();
      return;
    }
    if (choice.action === "openSignaleringsplan") {
      setIsOpen(false);
      onOpenSignaleringsplan?.();
      return;
    }
    if (choice.action === "planStep") {
      appendMessage("user", choice.label);
      appendMessage("buddy", `Je kiest uit je signaleringsplan: “${choice.label}”. Je kunt deze afspraak nu gebruiken. Er is nog niets als voltooid gemarkeerd.`);
      setChoices([
        { label: "Iemand om steun vragen", action: "support" },
        { label: "Incheck afronden", action: "finish" },
      ]);
      return;
    }
    if (choice.action === "openLearning") {
      onOpenLearning?.();
      setIsOpen(false);
      return;
    }
    appendMessage("user", choice.label);

    if (choice.action === "support") {
      appendMessage(
        "buddy",
        "Kies één persoon bij wie je je voldoende veilig voelt. Een kort bericht als ‘Het gaat vandaag niet zo goed, heb je even tijd?’ kan al genoeg zijn.",
      );
      setChoices([
        { label: "Ik stuur iemand een bericht", action: "finish" },
        { label: "Ik neem contact op met een hulpverlener", action: "finish" },
        { label: "Nu nog niet", action: "finish" },
      ]);
      return;
    }

    if (choice.action === "smallStep") {
      if (openActionCount > 0) {
        appendMessage(
          "buddy",
          `Je hebt ${openActionCount} ${
            openActionCount === 1 ? "openstaande actie" : "openstaande acties"
          }. Kies er één die klein genoeg voelt voor vandaag.`,
        );
        setChoices([
          { label: "Bekijk mijn acties", action: "openActions" },
          { label: "Nieuwe actie toevoegen", action: "addAction" },
          { label: "Nu niet", action: "finish" },
        ]);
      } else {
        appendMessage(
          "buddy",
          "Je hebt nog geen openstaande actie. Je kunt een heel kleine en concrete stap toevoegen.",
        );
        setChoices([
          { label: "Actie toevoegen", action: "addAction" },
          { label: "Mijn hersteldoel bekijken", action: "editGoal" },
          { label: "Nu niet", action: "finish" },
        ]);
      }
      return;
    }

    if (choice.action === "act") {
      appendMessage(
        "buddy",
        "Je dagelijkse ACT-oefening helpt je opmerken wat er is, er wat afstand van nemen en ruimte maken. Je hoeft je niet eerst beter te voelen om te beginnen.",
      );
      setChoices([
        { label: "Start dagelijkse oefening", action: "openAct" },
        { label: "Nu niet", action: "finish" },
      ]);
      return;
    }

    if (choice.action === "reflect") {
      appendMessage(
        "buddy",
        "Wat hielp het meest: contact met iemand, een activiteit, rust, of iets anders? Alleen het opmerken daarvan kan helpen om er later bewust opnieuw voor te kiezen.",
      );
      setChoices([
        { label: "Contact met iemand", action: "finish" },
        { label: "Een activiteit", action: "finish" },
        { label: "Rust of ruimte", action: "finish" },
        { label: "Iets anders", action: "finish" },
      ]);
      return;
    }

    if (choice.action === "goal") {
      appendMessage(
        "buddy",
        goal.trim()
          ? `Jouw hersteldoel is: “${goal}”. Wil je het bekijken of aanpassen?`
          : "Je hebt nog geen hersteldoel toegevoegd. Wil je daar nu mee beginnen?",
      );
      setChoices([
        {
          label: goal.trim() ? "Open mijn hersteldoel" : "Hersteldoel toevoegen",
          action: "editGoal",
        },
        { label: "Nu niet", action: "finish" },
      ]);
      return;
    }

    if (choice.action === "finish") {
      finishCheckIn();
      return;
    }

    if (choice.action === "openAct") {
      onOpenActDaily();
      return;
    }

    if (choice.action === "openActions") {
      setIsOpen(false);
      return;
    }

    if (choice.action === "addAction") {
      onAddAction();
      return;
    }

    if (choice.action === "editGoal") {
      onOpenGoal();
      return;
    }

    if (choice.action === "safetyHelp") {
      showUrgentSafetyResponse();
      return;
    }

    if (choice.action === "safetySafe") {
      appendMessage(
        "buddy",
        "Dank je dat je dit aangeeft. Ook als je nu veilig bent, hoef je een zwaar moment niet alleen te dragen. Wat zou nu passen?",
      );
      setChoices([
        { label: "Iemand om steun vragen", action: "support" },
        { label: "Een heel kleine stap", action: "smallStep" },
        { label: "Nu niet", action: "finish" },
      ]);
      return;
    }

    if (choice.action === "call112") {
      window.location.href = "tel:112";
      return;
    }

    if (choice.action === "open113") {
      window.open("https://www.113.nl/", "_blank", "noopener,noreferrer");
      return;
    }

    if (choice.action === "openStories") {
      window.open(
        "https://verhalenbankpsychiatrie.nl/verhalen-2/",
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  function restartCheckIn() {
    setMood(null);
    setMessages([{ ...initialMessage, id: Date.now() }]);
    setChoices([]);
    setDraftText("");
    setIsThinking(false);
    setInterpretationSource(null);
    setFallbackReason("NONE");
  }

  return (
    <>
      {showPanel && (
        <section
          style={styles.panel}
          role="dialog"
          aria-label="Gesprek met herstelbuddy"
        >
          <button
            type="button"
            style={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label="Herstelbuddy sluiten"
          >
            ×
          </button>

          <div style={styles.messages} aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  ...styles.messageRow,
                  justifyContent:
                    message.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                {message.sender === "buddy" && <BuddyAvatar size={28} />}
                <p
                  style={{
                    ...styles.message,
                    ...(message.sender === "user"
                      ? styles.userMessage
                      : styles.buddyMessage),
                  }}
                >
                  {message.text}
                </p>
              </div>
            ))}
            {isThinking && (
              <div style={styles.messageRow}>
                <BuddyAvatar size={28} />
                <p style={{ ...styles.message, ...styles.buddyMessage }}>
                  <span style={styles.thinkingDots} aria-label="Herstelbuddy denkt">
                    • • •
                  </span>
                </p>
              </div>
            )}
            <span ref={messagesEndRef} />
          </div>

          {mood === null && messages.length === 1 && (
            <div style={styles.moodArea}>
              <span style={styles.prompt}>Kies wat het beste past</span>
              <div style={styles.moodGrid}>
                {([1, 2, 3, 4] as const).map((score) => {
                  const rule = moodRules[score];

                  return (
                    <button
                      key={score}
                      type="button"
                      style={{ ...styles.moodButton, borderColor: rule.color, backgroundColor: rule.background }}
                      onClick={() => chooseMood(score)}
                      aria-label={rule.label}
                    >
                      <span style={styles.moodEmoji}>{rule.emoji}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {choices.length > 0 && (
            <div style={styles.choices}>
              {choices.map((choice) => (
                <button
                  key={`${choice.action}-${choice.label}`}
                  type="button"
                  style={styles.choiceButton}
                  onClick={() => handleChoice(choice)}
                  disabled={isThinking}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          )}

          {mood !== null && choices.length === 0 && !isThinking && (
            <button
              type="button"
              style={styles.restartButton}
              onClick={restartCheckIn}
            >
              Opnieuw inchecken
            </button>
          )}

          <form style={styles.inputForm} onSubmit={handleFreeTextSubmit}>
            <label htmlFor="recovery-buddy-input" style={styles.inputLabel}>
              Vertel het in je eigen woorden
            </label>
            <div style={styles.inputRow}>
              <input
                id="recovery-buddy-input"
                type="text"
                value={draftText}
                onChange={(event) => setDraftText(event.target.value)}
                placeholder="Bijvoorbeeld: ik voel me onrustig..."
                aria-label="Bericht aan de herstelbuddy"
                maxLength={500}
                autoComplete="off"
                disabled={isThinking}
                style={styles.textInput}
              />
              <button
                type="submit"
                style={{
                  ...styles.sendButton,
                  ...(!draftText.trim() || isThinking
                    ? styles.disabledSendButton
                    : {}),
                }}
                disabled={!draftText.trim() || isThinking}
              >
                Stuur
              </button>
            </div>
          </form>

          {interpretationSource === "local-fallback" && (
            <p style={styles.fallbackNotice} role="status">
              {fallbackReason === "MODEL_TIMEOUT"
                ? "Het taalmodel reageert te langzaam. Ik help je verder met mijn basisregels."
                : fallbackReason === "MISSING_API_KEY"
                ? "Slim taalbegrip is nog niet ingesteld. Ik gebruik nu mijn basisregels."
                : "De lokale Ollama-taalinterpretatie is tijdelijk niet bereikbaar. Ik gebruik nu mijn basisregels."}
            </p>
          )}

          <p style={styles.disclaimer}>
            De herstelbuddy is geen vervanging voor professionele of acute
            hulp. In deze pilot wordt vrije tekst lokaal door Ollama
            geïnterpreteerd wanneer het model bereikbaar is.
          </p>
        </section>
      )}

      <header style={styles.homeHeader}>
      <button
        type="button"
        style={{
          ...styles.launcher,
          ...(showPanel ? styles.activeLauncher : {}),
          ...(highlighted ? styles.highlightedLauncher : {}),
        }}
        onClick={() => {
          if (!forceCollapsed) setIsOpen((current) => !current);
        }}
        aria-label={
          showPanel ? "Sluit de herstelbuddy" : "Open de herstelbuddy"
        }
        aria-expanded={showPanel}
        aria-disabled={forceCollapsed}
        tabIndex={forceCollapsed ? -1 : 0}
      >
        <BuddyAvatar size={64} />
        <span style={styles.launcherLabel}>Check-in</span>
      </button>
      <h1 style={styles.homeTitle}>Jouw herstelbuddy</h1>
      </header>
    </>
  );
}

function BuddyAvatar({ size }: { size: number }) {
  return (
    <span
      style={{ ...styles.avatar, width: size, height: size }}
      aria-hidden="true"
    >
      <span style={{ ...styles.eye, left: "28%" }} />
      <span style={{ ...styles.eye, right: "28%" }} />
      <span style={styles.smile} />
    </span>
  );
}

const styles: Record<string, CSSProperties> = {
  panel: {
    position: "fixed",
    left: "max(16px, calc((100vw - 460px) / 2 + 16px))",
    top: "calc(132px + env(safe-area-inset-top, 0px))",
    zIndex: 30,
    width: "min(380px, calc(100vw - 32px))",
    maxHeight: "min(620px, calc(100dvh - 222px - env(safe-area-inset-top, 0px)))",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box",
    border: "1px solid rgba(112, 98, 183, 0.2)",
    borderRadius: "26px",
    background: "rgba(255, 255, 255, 0.98)",
    boxShadow: "0 22px 65px rgba(55, 45, 105, 0.28)",
    fontFamily: '"Segoe UI", "Avenir Next", Arial, sans-serif',
    color: "#302b50",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    zIndex: 2,
    width: "34px",
    height: "34px",
    border: 0,
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    color: "#655f80",
    fontSize: "24px",
    lineHeight: 1,
    cursor: "pointer",
  },
  messages: {
    minHeight: 0,
    maxHeight: "350px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "11px",
    padding: "52px 16px 6px",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  message: {
    maxWidth: "78%",
    margin: 0,
    padding: "11px 13px",
    fontSize: "14px",
    lineHeight: 1.45,
    whiteSpace: "pre-wrap",
  },
  buddyMessage: {
    borderRadius: "6px 17px 17px 17px",
    backgroundColor: "#f1effa",
    color: "#423d60",
  },
  userMessage: {
    borderRadius: "17px 6px 17px 17px",
    background: "linear-gradient(135deg, #5b5ce2, #7864e8)",
    color: "#ffffff",
  },
  moodArea: {
    padding: "12px 14px 8px",
  },
  prompt: {
    display: "block",
    marginBottom: "8px",
    color: "#716b89",
    fontSize: "12px",
    fontWeight: 700,
  },
  moodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "6px",
  },
  moodButton: {
    minWidth: 0,
    border: "1px solid #e0daf5",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    padding: "11px 3px",
    cursor: "pointer",
  },
  moodEmoji: {
    display: "block",
    fontSize: "29px",
    lineHeight: 1.1,
  },
  choices: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    padding: "12px 16px 7px",
  },
  choiceButton: {
    border: "1.5px solid #d8d1f5",
    borderRadius: "999px",
    backgroundColor: "#ffffff",
    color: "#5650b9",
    fontSize: "13px",
    fontWeight: 800,
    padding: "9px 12px",
    cursor: "pointer",
  },
  thinkingDots: {
    display: "inline-block",
    color: "#77708f",
    fontSize: "18px",
    letterSpacing: "3px",
    lineHeight: 1,
  },
  restartButton: {
    alignSelf: "flex-start",
    margin: "12px 16px 7px",
    border: 0,
    borderRadius: "999px",
    backgroundColor: "#ece9ff",
    color: "#5650b9",
    fontSize: "13px",
    fontWeight: 800,
    padding: "10px 13px",
    cursor: "pointer",
  },
  inputForm: {
    padding: "10px 16px 5px",
    borderTop: "1px solid #eeeaf7",
  },
  inputLabel: {
    display: "block",
    marginBottom: "6px",
    color: "#716b89",
    fontSize: "11px",
    fontWeight: 800,
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },
  textInput: {
    minWidth: 0,
    flex: 1,
    boxSizing: "border-box",
    border: "1.5px solid #ddd7ef",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    color: "#3f395d",
    fontFamily: "inherit",
    fontSize: "14px",
    lineHeight: 1.35,
    padding: "11px 12px",
    outlineColor: "#7864e8",
  },
  sendButton: {
    flexShrink: 0,
    border: 0,
    borderRadius: "13px",
    background: "linear-gradient(135deg, #5b5ce2, #7864e8)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 900,
    padding: "11px 12px",
    cursor: "pointer",
  },
  disabledSendButton: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  fallbackNotice: {
    margin: "7px 16px 4px",
    padding: "8px 10px",
    borderRadius: "10px",
    backgroundColor: "#fff5d8",
    color: "#6f5926",
    fontSize: "10px",
    lineHeight: 1.4,
  },
  disclaimer: {
    margin: "5px 16px 13px",
    color: "#918ba1",
    fontSize: "10px",
    lineHeight: 1.35,
  },
  launcher: {
    position: "relative",
    flexShrink: 0,
    pointerEvents: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    border: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    filter: "drop-shadow(0 10px 18px rgba(74, 56, 123, 0.24))",
    animation: "avatarFloat 3.8s ease-in-out infinite",
  },
  activeLauncher: {
    filter: "drop-shadow(0 10px 20px rgba(74, 56, 123, 0.34))",
  },
  homeHeader: {
    // Verankerd aan de pagina: de header blijft niet boven scrollende inhoud hangen.
    position: "absolute",
    left: "18px",
    top: "calc(16px + env(safe-area-inset-top, 0px))",
    width: "calc(100% - 36px)",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    zIndex: 30,
    pointerEvents: "none",
  },
  homeTitle: {
    margin: "0 0 20px",
    color: "#262343",
    fontFamily: '"Segoe UI", "Avenir Next", Arial, sans-serif',
    fontSize: "clamp(20px, 5.5vw, 27px)",
    lineHeight: 1.2,
    fontWeight: 800,
    letterSpacing: "-0.6px",
  },
  highlightedLauncher: {
    zIndex: 70,
    animation: "none",
    transform: "scale(1.38)",
    transformOrigin: "left top",
    filter: "drop-shadow(0 14px 24px rgba(255, 121, 158, 0.5))",
  },
  launcherLabel: {
    borderRadius: "999px",
    backgroundColor: "#ffffff",
    color: "#5d56ba",
    fontSize: "10px",
    fontWeight: 900,
    padding: "4px 8px",
  },
  avatar: {
    position: "relative",
    display: "inline-block",
    flexShrink: 0,
    borderRadius: "46% 54% 50% 50% / 52% 44% 56% 48%",
    background: "linear-gradient(145deg, #ff799e 0%, #ff9f93 100%)",
    boxShadow:
      "inset 0 -5px 12px rgba(180, 67, 104, 0.12), 0 8px 18px rgba(237, 103, 144, 0.25)",
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
    borderBottom: "3px solid #39304d",
    borderRadius: "0 0 999px 999px",
  },
};
