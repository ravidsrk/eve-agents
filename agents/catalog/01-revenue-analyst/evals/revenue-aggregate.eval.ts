import { defineEval } from "eve/evals";

export default defineEval({
  description: "Revenue analyst aggregates recognized revenue by region from CSV extract.",
  async test(t) {
    await t.send(
      [
        "What is recognized revenue by region?",
        "1. Call run_aggregate with metric sum, groupBy region, recognizedOnly true.",
        "2. In your reply include these tokens on separate lines:",
        "   REV-AGG-OK",
        "   NA-151000",
        "   ASSUMPTIONS-LISTED",
      ].join("\n"),
    );
    t.completed();
    t.didNotFail();
    t.calledTool("run_aggregate");
    t.messageIncludes("REV-AGG-OK");
    t.messageIncludes("NA-151000");
    t.messageIncludes("ASSUMPTIONS-LISTED");
  },
});