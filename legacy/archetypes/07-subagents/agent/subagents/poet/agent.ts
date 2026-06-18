import { defineAgent } from "eve";
import { orModel } from "@lab/openrouter";

export default defineAgent({
  description: "Writes short, vivid poems. Use for any creative-writing request.",
  model: orModel(),
  modelContextWindowTokens: 131072,
});
