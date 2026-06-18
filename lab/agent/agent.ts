import { defineAgent } from "eve";
import { orModel } from "@lab/openrouter";

// Model provider is OpenRouter (via @ai-sdk/openai-compatible), not the Vercel AI Gateway.
// Default model is a cheap, reliable paid model; override with OPENROUTER_MODEL.
//
// NOTE: when `model` is a custom LanguageModel (not a gateway id), eve cannot look up
// the context-window size from the AI Gateway, so compaction fails to compile. Supply it
// explicitly via `modelContextWindowTokens` (llama-3.1-8b-instruct = 131072).
export default defineAgent({
  model: orModel(),
  modelContextWindowTokens: 131072,
});
