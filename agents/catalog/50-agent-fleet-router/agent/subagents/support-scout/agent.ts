import { defineAgent } from "eve";
import { DEFAULT_CONTEXT_WINDOW, resolveModel } from "@eve-catalog/profile";

export default defineAgent({
  description:
    "Support scout subagent. Call for support ticket triage, KB lookup, and customer issue classification.",
  model: resolveModel(),
  modelContextWindowTokens: DEFAULT_CONTEXT_WINDOW,
});