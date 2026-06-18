import { defineAgent } from "eve";
import { orModel } from "@lab/openrouter";

export default defineAgent({
  description: "Computes mathematical results precisely. Use for any arithmetic or number theory.",
  model: orModel(),
  modelContextWindowTokens: 131072,
});
