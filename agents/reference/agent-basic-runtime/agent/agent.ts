import { defineAgent } from "eve";
import { MODELS, orModel } from "@eve-catalog/openrouter";

// Ported from vercel/eve e2e/fixtures — model swapped to OpenRouter.
// Vision model required for runtime/image-attachment eval (gpt-oss-120b has no image input).
// Upstream: https://github.com/vercel/eve/tree/main/e2e/fixtures
export default defineAgent({
  model: orModel("google/gemini-2.5-pro"),
  modelContextWindowTokens: 131072,
});
