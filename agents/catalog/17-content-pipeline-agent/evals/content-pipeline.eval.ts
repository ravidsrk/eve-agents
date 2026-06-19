import { defineEval } from "eve/evals";

export default defineEval({
  description: "Content pipeline: draft → review → revise across three turns.",
  async test(t) {
    await t.send(
      [
        "Turn 1 — Draft:",
        "Call load_dossier, then search_records with query 'content'.",
        "Reply with DRAFT-OK and one sentence of blog intro grounded in the records.",
      ].join("\n"),
    );
    t.calledTool("load_dossier");
    t.calledTool("search_records");
    t.messageIncludes("DRAFT-OK");

    const review = await t.send(
      "Turn 2 — Review: critique the draft for clarity and brand voice. Reply with REVIEW-OK and one concrete improvement.",
    );
    review.expectOk();
    t.messageIncludes("REVIEW-OK");

    const revise = await t.send(
      "Turn 3 — Revise: apply the improvement. Reply with REVISE-OK and the revised one-sentence intro.",
    );
    revise.expectOk();
    t.messageIncludes("REVISE-OK");

    t.didNotFail();
    t.completed();
  },
});