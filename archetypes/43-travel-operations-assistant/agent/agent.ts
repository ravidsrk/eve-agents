import { defineAgent } from "eve";
import { orModel } from "@lab/openrouter";

export default defineAgent({
  model: orModel(),
  modelContextWindowTokens: 131072,
});
