import { defineTool } from "eve/tools";
import { z } from "zod";

export const LEAD_SCAN_TOKEN = "schedule-lead-scan-A02";

export default defineTool({
  description:
    "Record a scheduled inbound lead scan tick. Only call when explicitly asked to use `record_lead_scan`.",
  inputSchema: z.object({
    note: z.string().min(1),
  }),
  async execute({ note }) {
    return { ok: true, note, token: LEAD_SCAN_TOKEN };
  },
});