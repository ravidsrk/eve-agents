import { defineEvalConfig } from "eve/evals";
import { referenceJudgeModel } from "../../_shared/judge-model.ts";

export default defineEvalConfig({
  judge: { model: referenceJudgeModel() },
  // SuperServe team quota is 30 concurrent sandboxes — run serially.
  maxConcurrency: 1,
});
