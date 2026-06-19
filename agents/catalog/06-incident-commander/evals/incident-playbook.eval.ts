import { defineEval } from "eve/evals";

export default defineEval({
  description: "Incident commander follows containment playbook on seeded records.",
  async test(t) {
    await t.send(
      [
        "You are triaging the incident queue.",
        "1. Call load_dossier.",
        "2. Call search_records with query 'urgent'.",
        "3. In your reply, include all of these tokens on separate lines:",
        "   CONTAINMENT",
        "   CUSTOMER-IMPACT",
        "   NEXT-OWNER",
      ].join("\n"),
    );
    t.completed();
    t.didNotFail();
    t.calledTool("load_dossier");
    t.calledTool("search_records");
    t.messageIncludes("CONTAINMENT");
    t.messageIncludes("CUSTOMER-IMPACT");
    t.messageIncludes("NEXT-OWNER");
  },
});