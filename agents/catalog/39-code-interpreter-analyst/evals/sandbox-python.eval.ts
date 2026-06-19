import { defineEval } from "eve/evals";

export default defineEval({
  description: "Sandbox: run_python executes real Python via ctx.getSandbox().",
  async test(t) {
    const turn = await t.send(
      "Use the run_python tool to compute the sum of 2, 3, and 4. Reply with just the number and SANDBOX-OK on separate lines.",
    );
    turn.expectOk();

    t.didNotFail();
    t.completed();
    t.calledTool("run_python", {
      input: { numbers: [2, 3, 4] },
      isError: false,
      output: { sum: 9 },
    });
    t.messageIncludes(/\b9\b/);
    t.messageIncludes("SANDBOX-OK");
  },
});