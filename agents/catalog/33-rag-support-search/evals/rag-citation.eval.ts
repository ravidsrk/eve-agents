import { defineEval } from "eve/evals";

export default defineEval({
  description: "RAG support cites document id and source when answering from corpus.",
  async test(t) {
    await t.send(
      [
        "Customer asks how billing proration works on a mid-cycle upgrade.",
        "1. Call search_kb with query 'proration'.",
        "2. In your reply include these tokens on separate lines:",
        "   RAG-CITED",
        "   doc-billing-proration",
        "   kb/billing-proration.md",
      ].join("\n"),
    );
    t.completed();
    t.didNotFail();
    t.calledTool("search_kb");
    t.messageIncludes("RAG-CITED");
    t.messageIncludes("doc-billing-proration");
    t.messageIncludes("kb/billing-proration.md");
  },
});