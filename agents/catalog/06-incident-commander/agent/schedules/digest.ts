import { defineSchedule } from "eve/schedules";

/**
 * Markdown schedule for periodic incident queue digests.
 * Exercised by `evals/schedule-digest.eval.ts` via dev-only dispatch.
 */
export default defineSchedule({
  cron: "0 8 * * *",
  markdown: [
    "Call the `record_digest` tool exactly once with note 'morning-digest'.",
    "Do not call any other tool. You have no other task.",
  ].join("\n"),
});