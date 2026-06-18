import { defineAgent } from "eve";
import { orModel } from "@lab/openrouter";

export default defineAgent({
  // Official templates use a single agent-level model config. This lab swaps the
  // default gateway id for an OpenRouter-backed AI SDK LanguageModel.
  model: orModel(),
  modelContextWindowTokens: 131072,
});
