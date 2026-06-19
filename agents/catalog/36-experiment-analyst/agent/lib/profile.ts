// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "36-experiment-analyst",
  title: "Experiment analyst",
  owner: "Growth",
  job: "Reviews A/B results and recommends ship/iterate/stop.",
  rule: "Report sample size, lift, uncertainty, and guardrail metrics.",
  tags: ["analytics","experiments"],
} as const;
