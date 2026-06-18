// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "38-data-catalog-steward",
  title: "Data catalog steward",
  owner: "Data Governance",
  job: "Documents datasets, owners, freshness, and PII flags.",
  rule: "Flag missing owner, freshness SLA, or PII classification.",
  tags: ["data","catalog"],
} as const;
