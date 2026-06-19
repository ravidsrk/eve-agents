import { orModel } from "@eve-agents/openrouter";

/** Lab-track judge: OpenRouter LanguageModel (not Vercel Gateway string ids). */
export function referenceJudgeModel() {
  return orModel(process.env.OPENROUTER_MODEL);
}