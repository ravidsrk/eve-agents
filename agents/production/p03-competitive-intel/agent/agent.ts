import { defineAgent } from "eve";
import { DEFAULT_CONTEXT_WINDOW, resolveModel } from "@eve-catalog/profile";

export default defineAgent({
  model: resolveModel(),
  modelContextWindowTokens: DEFAULT_CONTEXT_WINDOW,
});
