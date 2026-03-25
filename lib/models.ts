export const DEFAULT_SYSTEM_PROMPT =
  "You are Nova Core, the fast default assistant. Be crisp, commercially useful, and concise. Respond in markdown.";

export const PRO_DAILY_LIMIT = 60;

export const MODEL_CONFIGS = {
  core: {
    key: "core",
    label: "Gemini 3 Flash",
    badge: "FAST",
    engine: process.env.AI_MODEL_CORE_GEMINI ?? "google/gemini-3-flash-preview",
    systemPrompt: "You are the Gemini 3 Flash model. Be lightning fast, concise, and helpful.",
  },
  pro: {
    key: "pro",
    label: "Gemini 3.1 Pro",
    badge: "PREMIUM",
    engine: process.env.AI_MODEL_PRO_GEMINI ?? "google/gemini-3.1-pro-preview",
    systemPrompt: "You are the Gemini 3.1 Pro model. Be insightful, strategic, and remarkably intelligent.",
  },
} as const;

export const CORE_VARIANT_CONFIGS = {
  gemini: {
    key: "gemini",
    label: "Gemini 3 Flash",
    engine: process.env.AI_MODEL_CORE_GEMINI ?? "google/gemini-3-flash-preview",
    systemPrompt: "You are the Gemini 3 Flash model.",
  },
  gpt: {
    key: "gpt",
    label: "ChatGPT 5 Mini",
    engine: process.env.AI_MODEL_CORE_GPT ?? "openai/gpt-5-mini",
    systemPrompt: "You are the ChatGPT 5 Mini model.",
  },
} as const;

export const PRO_VARIANT_CONFIGS = {
  gemini: {
    key: "gemini",
    label: "Gemini 3.1 Pro",
    engine: process.env.AI_MODEL_PRO_GEMINI ?? "google/gemini-3.1-pro-preview",
    systemPrompt: "You are the Gemini 3.1 Pro model.",
  },
  gpt: {
    key: "gpt",
    label: "ChatGPT 5.4",
    engine: process.env.AI_MODEL_PRO_GPT ?? "openai/gpt-5.4",
    systemPrompt: "You are the ChatGPT 5.4 model.",
  },
  claude: {
    key: "claude",
    label: "Claude Sonnet 4.6",
    engine: process.env.AI_MODEL_PRO_CLAUDE ?? "anthropic/claude-sonnet-4.6",
    systemPrompt: "You are the Claude Sonnet 4.6 model.",
  },
} as const;

export type ModelKey = keyof typeof MODEL_CONFIGS;
export type CoreVariantKey = keyof typeof CORE_VARIANT_CONFIGS;
export type ProVariantKey = keyof typeof PRO_VARIANT_CONFIGS;

export function isModelKey(value: string | undefined): value is ModelKey {
  return value === "core" || value === "pro";
}

export function isCoreVariantKey(value: string | undefined): value is CoreVariantKey {
  return value === "gemini" || value === "gpt";
}

export function isProVariantKey(value: string | undefined): value is ProVariantKey {
  return value === "gemini" || value === "gpt" || value === "claude";
}

export function getModelConfig(modelKey: string | undefined) {
  return MODEL_CONFIGS[isModelKey(modelKey) ? modelKey : "core"];
}

export function getCoreVariantConfig(variant: string | undefined) {
  return CORE_VARIANT_CONFIGS[isCoreVariantKey(variant) ? variant : "gemini"];
}

export function getProVariantConfig(variant: string | undefined) {
  return PRO_VARIANT_CONFIGS[isProVariantKey(variant) ? variant : "gemini"];
}
