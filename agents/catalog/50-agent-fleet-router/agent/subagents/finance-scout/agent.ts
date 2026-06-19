import { defineAgent } from "eve";
import { DEFAULT_CONTEXT_WINDOW, resolveModel } from "@eve-agents/profile";

export default defineAgent({
  description:
    "Finance scout subagent. Call for revenue KPI questions, finance analytics, and recognized revenue analysis.",
  model: resolveModel(),
  modelContextWindowTokens: DEFAULT_CONTEXT_WINDOW,
});