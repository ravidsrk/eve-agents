import { defineEval } from "eve/evals";

const SALES_TOKEN = "FLEET-SALES-A50";

export default defineEval({
  description: "Fleet router delegates sales tasks to sales-scout subagent.",
  async test(t) {
    const turn = await t.send(
      [
        "Inbound sales lead enrichment task.",
        "1. Call list_registry with tag sales.",
        "2. Use the sales-scout subagent with message 'score lead'.",
        "3. Include the subagent output verbatim and reply ROUTE-OK on its own line.",
      ].join("\n"),
    );
    turn.expectOk();

    t.didNotFail();
    t.completed();
    t.calledTool("list_registry");
    t.calledSubagent("sales-scout", { output: new RegExp(SALES_TOKEN) });
    t.messageIncludes(SALES_TOKEN);
    t.messageIncludes("ROUTE-OK");
  },
});