import { defineEval } from "eve/evals";

export default defineEval({
  description: "Smoke: Inventory replenishment planner loads dossier and completes a turn.",
  async test(t) {
    await t.send(
      [
        "Follow these steps exactly:",
        "1. Call load_dossier.",
        "2. Call analyze_records with query 'priority'.",
        "3. Reply with the word DOSSIER-OK on its own line.",
      ].join("\n"),
    );
    t.completed();
    t.didNotFail();
    t.calledTool("load_dossier");
    t.calledTool("analyze_records");
    t.messageIncludes("DOSSIER-OK");
  },
});
