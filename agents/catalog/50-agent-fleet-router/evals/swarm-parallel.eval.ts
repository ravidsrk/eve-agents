import { defineEval } from "eve/evals";

export default defineEval({
  description: "Fleet router runs parallel swarm_run jobs in isolated sandboxes.",
  async test(t) {
    const turn = await t.send(
      [
        "Run swarm_run once with exactly two jobs:",
        "- name: sum-six, code: print(6)",
        "- name: sum-ten, code: print(10)",
        "Reply with SWARM-OK and include both stdout values 6 and 10.",
      ].join("\n"),
    );
    turn.expectOk();

    t.didNotFail();
    t.completed();
    t.calledTool("swarm_run");
    t.messageIncludes("SWARM-OK");
    t.messageIncludes("6");
    t.messageIncludes("10");
  },
});