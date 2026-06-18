import { defineTool } from "eve/tools";
import { z } from "zod";
import { appendFileSync, readFileSync, existsSync } from "node:fs";

const LOG = "/tmp/eve-cron-heartbeats.log";

export default defineTool({
  description: "Record a heartbeat with the current timestamp and return the running count.",
  inputSchema: z.object({}),
  async execute() {
    appendFileSync(LOG, new Date().toISOString() + "\n");
    const count = existsSync(LOG) ? readFileSync(LOG, "utf-8").trim().split("\n").filter(Boolean).length : 0;
    return { recordedAt: new Date().toISOString(), totalHeartbeats: count };
  },
});
