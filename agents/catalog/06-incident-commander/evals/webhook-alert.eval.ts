import { defineEval } from "eve/evals";
import { postChannel } from "./channel-shared.ts";

export default defineEval({
  description: "Alert webhook ingests incident payload and starts investigation session.",

  async test(t) {
    if (!t.target.capabilities.devRoutes) {
      t.log("Target has no dev routes; alert webhook eval is dev-only. Skipping.");
      return;
    }

    const payload = await postChannel<{ ok: boolean; sessionId?: string }>(t.target, "/incident", {
      title: "API latency spike",
      reference: "INC-TEST-42",
      severity: "high",
    });
    if (payload.ok !== true || typeof payload.sessionId !== "string") {
      throw new Error(`Unexpected alert response: ${JSON.stringify(payload)}`);
    }

    const session = await t.target.attachSession(payload.sessionId);
    const turn = await session.readTurn();
    turn.expectOk();

    t.didNotFail();
    t.completed();
    t.calledTool("load_dossier");
    t.messageIncludes("ALERT-ACK");
  },
});