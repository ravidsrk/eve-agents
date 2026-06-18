import { defineSchedule } from "eve/schedules";

// Every 5 minutes in production (Vercel Cron, UTC). In `eve dev`, schedules never fire on
// cadence — trigger once with: POST /eve/v1/dev/schedules/heartbeat
export default defineSchedule({
  cron: "*/5 * * * *",
  markdown: "Record a heartbeat now using the record_heartbeat tool, then report the new count.",
});
