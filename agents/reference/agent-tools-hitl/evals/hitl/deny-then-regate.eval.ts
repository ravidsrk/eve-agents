import { defineEval } from "eve/evals";

import { guardedEchoResults } from "./shared.js";

/**
 * HITL flow: `once()` approval semantics — a denial does not grant, so the
 * follow-up guarded call re-parks. Parking is server-side, so every
 * park/resume here is deterministic.
 */
export default defineEval({
  description: "HITL smoke: a denied once() call does not execute and re-gates the next call.",
  async test(t) {
    await t.send('Call the guarded-echo tool with note "denied-call".');
    t.expectInputRequests({ toolName: "guarded-echo" });

    const denied = await t.respondAll("deny");
    denied.expectOk();
    if (guardedEchoResults(t.events).length > 0) {
      throw new Error("Denied guarded-echo call must not execute.");
    }

    const retryPrompts = [
      'You must call the guarded-echo tool again with note "retry-call". Do not finish until the tool is invoked.',
      'Invoke guarded-echo with note "retry-call" now. Approval is required.',
      'Call guarded-echo(note="retry-call") before replying.',
    ];
    let regated = false;
    for (const prompt of retryPrompts) {
      const retry = await t.send(prompt);
      retry.expectOk();
      if (retry.inputRequests.length > 0) {
        regated = true;
        break;
      }
      try {
        t.expectInputRequests({ toolName: "guarded-echo" });
        regated = true;
        break;
      } catch {
        // model completed without re-parking; try a stronger follow-up prompt
      }
    }
    if (!regated) {
      throw new Error("once() denial must re-gate: expected pending input after retry send.");
    }

    t.didNotFail();
    t.waiting();
  },
});