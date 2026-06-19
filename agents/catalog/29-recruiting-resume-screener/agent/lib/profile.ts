// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "29-recruiting-resume-screener",
  title: "Recruiting resume screener",
  owner: "Recruiting",
  job: "Screens resumes against job criteria with fairness guardrails.",
  rule: "Use only job-related criteria and avoid protected-class inferences.",
  tags: ["recruiting","fairness"],
} as const;
