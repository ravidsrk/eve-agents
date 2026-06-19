import { defineAgent } from "eve";
import { orModel } from "@eve-catalog/openrouter";

export default defineAgent({
  model: orModel(),
  modelContextWindowTokens: 131072,
});
