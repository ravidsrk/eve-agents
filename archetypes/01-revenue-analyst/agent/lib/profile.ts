// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "01-revenue-analyst",
  title: "Revenue analyst",
  owner: "Finance",
  job: "Answers KPI/revenue questions from a warehouse extract and explains assumptions.",
  rule: "Use the revenue recognition skill before answering revenue questions.",
  tags: ["finance","analytics"],
} as const;
