import { defineTool } from "eve/tools";
import { z } from "zod";

/** Deterministic token for schedule-dispatch eval proof. */
export const DIGEST_TOKEN = "schedule-digest-ok-A06";

/**
 * Tool the `digest` schedule (`agent/schedules/digest.ts`) instructs the agent
 * to call when the cron fires. Returns a deterministic token so evals can prove
 * the schedule path started a session and ran the agent.
 */
export default defineTool({
  description:
    "Record a scheduled incident digest tick. Only call when explicitly asked to use `record_digest`.",
  inputSchema: z.object({
    note: z.string().min(1).describe("Short note for this digest tick."),
  }),
  async execute({ note }) {
    return { ok: true, note, token: DIGEST_TOKEN };
  },
});