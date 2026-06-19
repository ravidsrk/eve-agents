import type { HandleMessageStreamEvent } from "eve/client";
import { defineEval } from "eve/evals";
import { LEAD_SCAN_TOKEN } from "../agent/tools/record_lead_scan.ts";

export default defineEval({
  description: "Schedule dispatch: inbound-lead cron runs record_lead_scan.",

  async test(t) {
    if (!t.target.capabilities.devRoutes) {
      t.log("Target has no dev routes; schedule dispatch is dev-only. Skipping.");
      return;
    }

    const dispatch = await t.target.dispatchSchedule("inbound-lead");
    if (dispatch.scheduleId !== "inbound-lead") {
      throw new Error(`Expected scheduleId inbound-lead; got ${JSON.stringify(dispatch.scheduleId)}.`);
    }
    const [sessionId] = dispatch.sessionIds;
    if (sessionId === undefined) throw new Error("Schedule dispatch returned no session ids.");

    const session = await t.target.attachSession(sessionId);
    const failures = session.events.filter(
      (e) => e.type === "session.failed" || e.type === "turn.failed" || e.type === "step.failed",
    );
    if (failures.length > 0) throw new Error(`Schedule session failed: ${JSON.stringify(failures.map((e) => e.type))}`);

    const outputs = leadScanResults(session.events);
    if (!outputs.some((o) => o.includes(LEAD_SCAN_TOKEN))) {
      throw new Error(`record_lead_scan missing token ${LEAD_SCAN_TOKEN}: ${JSON.stringify(outputs)}`);
    }

    t.didNotFail();
    t.completed();
  },
});

function leadScanResults(events: readonly HandleMessageStreamEvent[]): string[] {
  const out: string[] = [];
  for (const event of events) {
    if (event.type !== "action.result") continue;
    const result = event.data.result;
    if (result.kind !== "tool-result" || result.toolName !== "record_lead_scan") continue;
    out.push(JSON.stringify(result.output ?? ""));
  }
  return out;
}