import { defineEval } from "eve/evals";

export default defineEval({
  description: "Smoke: incident commander completes a minimal turn.",
  async test(t) {
    await t.send('Reply with exactly the text "incident-smoke-ok" and nothing else.');
    t.completed();
    t.didNotFail();
    t.messageIncludes("incident-smoke-ok");
    t.usedNoTools();
  },
});