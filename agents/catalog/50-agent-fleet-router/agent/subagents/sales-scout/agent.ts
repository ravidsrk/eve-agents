import { defineAgent } from "eve";
import { DEFAULT_CONTEXT_WINDOW, resolveModel } from "@eve-catalog/profile";

export default defineAgent({
  description:
    "Sales scout subagent. Call for inbound lead enrichment, fit scoring, and sales research tasks.",
  model: resolveModel(),
  modelContextWindowTokens: DEFAULT_CONTEXT_WINDOW,
});