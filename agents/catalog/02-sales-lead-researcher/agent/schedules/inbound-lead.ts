import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1-5",
  markdown: [
    "Call the `record_lead_scan` tool exactly once with note 'inbound-lead-scan'.",
    "Do not call any other tool. You have no other task.",
  ].join("\n"),
});