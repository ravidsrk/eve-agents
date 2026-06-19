import { defineEval } from "eve/evals";

const SUBAGENT_TOKEN = "SUBAGENT_TOKEN=echo-marker-9F2X";

/**
 * Local subagent delegation: the `echo-marker` child's instructions pin its
 * reply to the exact SUBAGENT_TOKEN string, so the token in the parent's final
 * message proves the child's output was spliced back into the conversation.
 */
export default defineEval({
  description: "Local subagent delegation smoke: child output reaches the parent reply verbatim.",
  async test(t) {
    const turn = await t.send(
      [
        "Use the echo-marker subagent with message 'ping'.",
        "When the subagent returns, your entire assistant reply must include this exact string verbatim:",
        SUBAGENT_TOKEN,
        "Do not paraphrase. Do not reply with only 'pong'.",
      ].join(" "),
    );
    turn.expectOk();

    t.didNotFail();
    t.completed();
    t.calledSubagent("echo-marker");
    t.messageIncludes(SUBAGENT_TOKEN);
  },
});
