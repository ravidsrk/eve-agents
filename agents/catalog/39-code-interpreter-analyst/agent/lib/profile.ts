// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "39-code-interpreter-analyst",
  title: "Code interpreter analyst",
  owner: "Analytics",
  job: "Runs ad-hoc Python analysis over uploaded data.",
  rule: "Use sandbox code for calculations instead of mental math.",
  tags: ["python","analysis"],
} as const;
