// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "12-code-review-risk-assessor",
  title: "Code review risk assessor",
  owner: "Engineering",
  job: "Reviews a patch for correctness, security, and test gaps.",
  rule: "Findings must reference file paths or patch hunks when possible.",
  tags: ["review","quality"],
} as const;
