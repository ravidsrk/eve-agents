// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "41-insurance-claims-triage",
  title: "Insurance claims triage",
  owner: "Insurance Ops",
  job: "Prioritizes claims, missing evidence, and fraud indicators.",
  rule: "Do not deny claims; route high-risk cases to licensed reviewers.",
  tags: ["insurance","claims"],
} as const;
