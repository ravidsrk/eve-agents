import type { HandleMessageStreamEvent } from "eve/client";
import { defineEval } from "eve/evals";

const GOOG_PRICE = "178.92";

function subagentOutputs(events: readonly HandleMessageStreamEvent[]): string[] {
  const outputs: string[] = [];
  for (const event of events) {
    if (event.type !== "subagent.completed") continue;
    outputs.push(JSON.stringify(event.data.output ?? ""));
  }
  return outputs;
}

function approvalOptionId(
  options: ReadonlyArray<{ id: string }> | undefined,
): string {
  const ids = (options ?? []).map((o) => o.id);
  const preferred = ids.find((id) => /approve|allow|yes|confirm/i.test(id));
  return preferred ?? ids[0] ?? "approve";
}

/**
 * Parent/child HITL proxying: stock-price subagent tool approval surfaces on
 * the parent stream, routes back down, and splices the child result into reply.
 */
export default defineEval({
  description: "Subagent tool approval proxied through the parent session.",

  async test(t) {
    const parked = await t.send(
      [
        "Delegate to the stock-price subagent only.",
        'Subagent task: call get_stock_price with ticker "GOOG".',
        `When done, your reply must include the exact price ${GOOG_PRICE}.`,
      ].join(" "),
    );
    parked.expectOk();

    const [request] = t.expectInputRequests({ toolName: "get_stock_price" });
    if (request === undefined) {
      throw new Error("Expected get_stock_price approval on parent stream.");
    }

    const resumed = await t.respondAll(approvalOptionId(request.options));
    resumed.expectOk();

    const outputs = subagentOutputs(t.events);
    if (!outputs.some((output) => output.includes(GOOG_PRICE))) {
      throw new Error(
        `No subagent.completed output contained the GOOG price; got [${outputs.join(", ")}].`,
      );
    }

    t.didNotFail();
    t.completed();
    t.messageIncludes(GOOG_PRICE);
  },
});