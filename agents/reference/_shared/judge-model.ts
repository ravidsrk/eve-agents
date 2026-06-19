import { orModel } from "@eve-catalog/openrouter";

/** Lab-track judge: OpenRouter LanguageModel (not Vercel Gateway string ids). */
export function referenceJudgeModel() {
  return orModel(process.env.OPENROUTER_MODEL);
}