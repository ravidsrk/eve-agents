import { defineAgent } from "eve";
import { orModel } from "@eve-agents/openrouter";

export default defineAgent({
  model: orModel(),
  modelContextWindowTokens: 131072,
});
