"use server";

import { buddyLanguageMapping, mappingPromptContext } from "./BuddyLanguageMapping";

import {
  buddyActionTypes,
  buddyInterpretationSchema,
  buildBuddyClassifierInstructions,
  classifyBuddyLocally,
  getBuddyFastInterpretation,
  inferBuddyTopic,
  createBuddyInterpretation,
  isBuddyInterpretation,
  type BuddyActionContext,
  type BuddyActionType,
  type BuddyContext,
  type BuddyRecentMessage,
  type BuddyRequest,
  type BuddyResult,
} from "./BuddyLibrary";

// Next.js stelt `process.env` op de server beschikbaar. Deze lokale typering
// houdt dit losse prototype compileerbaar als @types/node nog niet is ingesteld.
declare const process: {
  env: {
    OLLAMA_BASE_URL?: string;
    OLLAMA_BUDDY_MODEL?: string;
    OLLAMA_BUDDY_TIMEOUT_MS?: string;
  };
};

const classifierInstructions = buildBuddyClassifierInstructions();

/**
 * Next.js Server Action. De browser roept deze functie aan, maar alleen de
 * Next.js-server maakt verbinding met de lokale Ollama-service.
 */
export async function interpretBuddyMessage(
  input: BuddyRequest,
): Promise<BuddyResult> {
  const request = parseRequest(input);

  if (!request) {
    return {
      interpretation: createBuddyInterpretation({
        primaryIntent: "UNKNOWN",
        needsClarification: true,
        clarificationType: "GENERAL",
      }),
      source: "local-fallback",
      fallbackReason: "INVALID_REQUEST",
    };
  }

  const localResult = classifyBuddyLocally(
    request.message,
    request.context,
  );

  // Direct herkenbare veiligheidszinnen wachten niet op een modelantwoord.
  if (localResult.safety !== "NONE") {
    return {
      interpretation: localResult,
      source: "local-safety",
      fallbackReason: "NONE",
    };
  }

  const fast = getBuddyFastInterpretation(request.message, request.context);
  if (fast) return { interpretation: fast, source: "local-rule", fallbackReason: "NONE" };

  try {
    const modelResult = await classifyWithOllama(
      request.message,
      request.context,
    );

    return {
      interpretation: modelResult,
      source: "llm",
      fallbackReason: "NONE",
    };
  } catch (error) {
    // Log uitsluitend technische informatie, nooit de ingevoerde vrije tekst.
    console.error(
      "Recovery-buddy intent-router mislukt:",
      error instanceof Error ? error.name : "onbekende fout",
    );

    return {
      interpretation: { ...localResult, topic: localResult.topic || inferBuddyTopic(request.message) },
      source: "local-fallback",
      fallbackReason: error instanceof Error && error.name === "AbortError" ? "MODEL_TIMEOUT" : "MODEL_ERROR",
    };
  }
}

function parseRequest(value: unknown): BuddyRequest | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as {
    message?: unknown;
    context?: {
      currentScreen?: unknown;
      hasGoal?: unknown;
      openActionCount?: unknown;
      openActions?: unknown;
      selectedActionId?: unknown;
      hasActModule?: unknown;
      recentMessages?: unknown;
      pendingMappingId?: unknown;
    };
  };
  const message = cleanText(candidate.message, 500);

  if (!message) return null;

  const openActions = parseOpenActions(candidate.context?.openActions);
  const recentMessages = parseRecentMessages(candidate.context?.recentMessages);

  return {
    message,
    context: {
      currentScreen: cleanText(candidate.context?.currentScreen, 60),
      hasGoal: candidate.context?.hasGoal === true,
      openActionCount:
        typeof candidate.context?.openActionCount === "number" &&
        Number.isFinite(candidate.context.openActionCount)
          ? Math.max(0, Math.floor(candidate.context.openActionCount))
          : openActions.length,
      openActions,
      selectedActionId: cleanText(candidate.context?.selectedActionId, 80),
      hasActModule: candidate.context?.hasActModule === true,
      recentMessages,
      pendingMappingId: buddyLanguageMapping.some(item => item.id === candidate.context?.pendingMappingId) ? String(candidate.context?.pendingMappingId) : "",
    },
  };
}

function cleanText(value: unknown, maximumLength: number) {
  return typeof value === "string"
    ? value.trim().slice(0, maximumLength)
    : "";
}

function parseOpenActions(value: unknown): BuddyActionContext[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 20)
    .map((item): BuddyActionContext | null => {
      if (!item || typeof item !== "object") return null;

      const candidate = item as {
        id?: unknown;
        title?: unknown;
        actionType?: unknown;
      };
      const id = cleanText(candidate.id, 80);
      const title = cleanText(candidate.title, 160);
      const actionType = buddyActionTypes.includes(
        candidate.actionType as BuddyActionType,
      )
        ? (candidate.actionType as BuddyActionType)
        : "OTHER";

      if (!id || !title || actionType === "NONE") return null;

      return { id, title, actionType } as BuddyActionContext;
    })
    .filter((item): item is BuddyActionContext => item !== null);
}

function parseRecentMessages(value: unknown): BuddyRecentMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-6)
    .map((item): BuddyRecentMessage | null => {
      if (!item || typeof item !== "object") return null;

      const candidate = item as { role?: unknown; text?: unknown };
      const role = candidate.role === "user" ? "user" : "buddy";
      const text = cleanText(candidate.text, 300);

      return text ? { role, text } : null;
    })
    .filter((item): item is BuddyRecentMessage => item !== null);
}

async function classifyWithOllama(
  message: string,
  context: BuddyContext,
) {
  const baseUrl = (
    process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434"
  ).replace(/\/+$/, "");
  const model = process.env.OLLAMA_BUDDY_MODEL ?? "qwen3:4b";
  const abortController = new AbortController();
  const configuredTimeout = Number(process.env.OLLAMA_BUDDY_TIMEOUT_MS ?? 8000);
  const timeoutMs = Number.isFinite(configuredTimeout) ? Math.min(8000, Math.max(1000, configuredTimeout)) : 8000;
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);
  try {
    const history = context.recentMessages.slice();
    if (history[history.length - 1]?.role === "user" && history[history.length - 1]?.text === message) history.pop();
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: abortController.signal,
      body: JSON.stringify({
        model, stream: false, think: false, keep_alive: "30m",
        format: buddyInterpretationSchema,
        options: { temperature: 0, num_predict: 300 },
        messages: [
          { role: "system", content: classifierInstructions },
          { role: "user", content: JSON.stringify({ lastUserMessage: message, relevantMappings: mappingPromptContext(message), pendingQuestion: buddyLanguageMapping.find(item => item.id === context.pendingMappingId), appContext: { ...context, recentMessages: history.slice(-4) } }) },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
    // De deadline geldt ook voor het lezen van de responsebody.
    const body = await response.json() as { message?: { content?: unknown }; done?: boolean };
    if (typeof body.message?.content !== "string") throw new Error("Invalid model response");
    const parsed: unknown = JSON.parse(body.message.content);
    if (!isBuddyInterpretation(parsed)) throw new Error("Invalid intent schema");
    return {
      ...parsed,
      topic: parsed.topic || inferBuddyTopic(message),
      mappingOptionId: parsed.mappingId === context.pendingMappingId ? parsed.mappingOptionId : "",
      referencedActionId: context.openActions.some(action => action.id === parsed.referencedActionId) ? parsed.referencedActionId : "",
      extractedText: parsed.extractedText && message.includes(parsed.extractedText) ? parsed.extractedText : "",
    };
  } finally {
    clearTimeout(timeout);
  }
}
