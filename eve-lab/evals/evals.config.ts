import { defineEvalConfig } from "eve/evals";

// Deterministic suite — no LLM judge needed. (To add judge assertions later, set
// judge: { model: orModel() } from @lab/openrouter.)
export default defineEvalConfig({});
