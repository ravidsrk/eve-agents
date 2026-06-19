// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "08-cloud-cost-optimizer",
  title: "Cloud cost optimizer",
  owner: "Platform",
  job: "Finds avoidable spend and proposes low-risk savings actions.",
  rule: "Distinguish rightsizing, deletion, reservation, and architecture changes.",
  tags: ["cost","finops"],
} as const;
