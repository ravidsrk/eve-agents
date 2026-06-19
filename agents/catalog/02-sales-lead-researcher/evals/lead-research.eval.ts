import { defineEval } from "eve/evals";

export default defineEval({
  description: "Sales lead researcher scores inbound queue and states next action.",
  async test(t) {
    await t.send(
      [
        "New inbound enterprise lead in the queue.",
        "1. Call load_dossier.",
        "2. Call search_records with query 'sales'.",
        "3. Reply with these tokens on separate lines:",
        "   LEAD-OK",
        "   FIT-SCORE",
        "   NEXT-ACTION",
      ].join("\n"),
    );
    t.completed();
    t.didNotFail();
    t.calledTool("load_dossier");
    t.calledTool("search_records");
    t.messageIncludes("LEAD-OK");
    t.messageIncludes("FIT-SCORE");
    t.messageIncludes("NEXT-ACTION");
  },
});