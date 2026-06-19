import { defineAgent } from "eve";
import { orModel } from "@eve-agents/openrouter";

// Ported from vercel/eve e2e/fixtures — model swapped to OpenRouter.
// Upstream: https://github.com/vercel/eve/tree/main/e2e/fixtures
export default defineAgent({
  model: orModel(),
  modelContextWindowTokens: 131072,
});
