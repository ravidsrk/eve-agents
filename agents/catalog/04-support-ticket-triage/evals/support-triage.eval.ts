import { defineEval } from "eve/evals";

export default defineEval({
  description: "Support triage uses KB lookup and states billing escalation path.",
  async test(t) {
    await t.send(
      [
        "A customer opened a billing dispute for $900 and threatens a chargeback.",
        "1. Call search_kb with query 'billing dispute'.",
        "2. End your reply with these exact lines (copy verbatim):",
        "KB-CITED",
        "ESC-BILLING",
      ].join("\n"),
    );
    t.completed();
    t.didNotFail();
    t.calledTool("search_kb");
    t.messageIncludes("KB-CITED");
    t.messageIncludes("ESC-BILLING");
  },
});