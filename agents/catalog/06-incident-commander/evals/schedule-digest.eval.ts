import type { HandleMessageStreamEvent } from "eve/client";
import { defineEval } from "eve/evals";
import { DIGEST_TOKEN } from "../agent/tools/record_digest.ts";

/**
 * Exercises schedule dispatch: fire the `digest` markdown schedule through the
 * dev dispatch route, attach to the started session, and prove record_digest ran.
 */
export default defineEval({
  description: "Schedule dispatch: digest cron runs record_digest with deterministic token.",

  async test(t) {
    if (!t.target.capabilities.devRoutes) {
      t.log("Target has no dev routes (deployed build); schedule dispatch is dev-only. Skipping.");
      return;
    }

    const dispatch = await t.target.dispatchSchedule("digest");
    if (dispatch.scheduleId !== "digest") {
      throw new Error(
        `Expected scheduleId "digest"; got ${JSON.stringify(dispatch.scheduleId)}.`,
      );
    }
    const [sessionId] = dispatch.sessionIds;
    if (sessionId === undefined) {
      throw new Error("Schedule dispatch returned no session ids.");
    }
    t.log(`digest dispatched session ${sessionId}`);

    const session = await t.target.attachSession(sessionId);

    const failures = session.events.filter(
      (event) =>
        event.type === "session.failed" ||
        event.type === "turn.failed" ||
        event.type === "step.failed",
    );
    if (failures.length > 0) {
      throw new Error(`Dispatched schedule session failed: ${formatTypes(failures)}`);
    }

    const digestResults = digestToolResults(session.events);
    if (digestResults.length === 0) {
      throw new Error(
        `Expected at least one record_digest result; saw event types ${formatTypes(session.events)}.`,
      );
    }
    if (!digestResults.some((output) => output.includes(DIGEST_TOKEN))) {
      throw new Error(
        `record_digest ran but no result carried token ${DIGEST_TOKEN}: ${JSON.stringify(digestResults)}.`,
      );
    }

    t.didNotFail();
    t.completed();
  },
});

function digestToolResults(events: readonly HandleMessageStreamEvent[]): string[] {
  const results: string[] = [];
  for (const event of events) {
    if (event.type !== "action.result") continue;
    const result = event.data.result;
    if (result.kind !== "tool-result" || result.toolName !== "record_digest") continue;
    results.push(JSON.stringify(result.output ?? ""));
  }
  return results;
}

function formatTypes(events: readonly HandleMessageStreamEvent[]): string {
  return JSON.stringify(events.map((event) => event.type));
}