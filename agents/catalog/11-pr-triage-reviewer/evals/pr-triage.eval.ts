import { defineEval } from "eve/evals";

export default defineEval({
  description: "PR triage analyzes seeded patch and labels auth/security risk.",
  async test(t) {
    await t.send(
      [
        "Triage the open PR diff.",
        "1. Call analyze_diff (default seeded patch).",
        "2. In your reply include these tokens on separate lines:",
        "   PR-TRIAGE-OK",
        "   AUTH-CHANGE",
        "   SECURITY-REVIEW",
        "   SUGGEST-REVIEWERS",
      ].join("\n"),
    );
    t.completed();
    t.didNotFail();
    t.calledTool("analyze_diff");
    t.messageIncludes("PR-TRIAGE-OK");
    t.messageIncludes("AUTH-CHANGE");
    t.messageIncludes("SECURITY-REVIEW");
    t.messageIncludes("SUGGEST-REVIEWERS");
  },
});