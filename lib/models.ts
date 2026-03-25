export const DEFAULT_SYSTEM_PROMPT =
  "You are Nova Core, the fast default assistant. Be crisp, commercially useful, and concise. Respond in markdown.";

export const PRO_DAILY_LIMIT = 60;

export const MODEL_CONFIGS = {
  core: {
    key: "core",
    label: "Nova Core",
    badge: "STANDARD",
    engine: process.env.AI_MODEL_FREE ?? process.env.AI_MODEL ?? "openai/gpt-4o-mini",
    systemPrompt:
      "You are Nova Core, the fast default assistant. Be crisp, commercially useful, and concise. Respond in markdown.",
  },
  pro: {
    key: "pro",
    label: "Nova Quantum Pro",
    badge: "PREMIUM",
    engine: process.env.AI_MODEL_PRO ?? process.env.AI_MODEL_PRO_CLAUDE ?? "anthropic/claude-3.5-sonnet",
    systemPrompt:
      "You are Nova Quantum Pro, the premium strategist model. Think deeper, structure answers beautifully, and respond in polished markdown with stronger insight density.",
  },
} as const;

export const PRO_VARIANT_CONFIGS = {
  claude: {
    key: "claude",
    label: "Claude",
    engine: process.env.AI_MODEL_PRO_CLAUDE ?? process.env.AI_MODEL_PRO ?? "anthropic/claude-3.5-sonnet",
    systemPrompt:
      "You are Nova Quantum Pro (Claude mode). Be strategic, concise, and structured. Respond in markdown.",
  },
  gpt: {
    key: "gpt",
    label: "GPT",
    engine: process.env.AI_MODEL_PRO_GPT ?? "openai/gpt-4o",
    systemPrompt:
      "You are Nova Quantum Pro (GPT mode). Prioritize clarity, practical execution, and crisp markdown output.",
  },
} as const;

export type ModelKey = keyof typeof MODEL_CONFIGS;
export type ProVariantKey = keyof typeof PRO_VARIANT_CONFIGS;

export function isModelKey(value: string | undefined): value is ModelKey {
  return value === "core" || value === "pro";
}

export function isProVariantKey(value: string | undefined): value is ProVariantKey {
  return value === "claude" || value === "gpt";
}

export function getModelConfig(modelKey: string | undefined) {
  return MODEL_CONFIGS[isModelKey(modelKey) ? modelKey : "core"];
}

export function getProVariantConfig(variant: string | undefined) {
  return PRO_VARIANT_CONFIGS[isProVariantKey(variant) ? variant : "claude"];
}
