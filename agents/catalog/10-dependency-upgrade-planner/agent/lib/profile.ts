// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "10-dependency-upgrade-planner",
  title: "Dependency upgrade planner",
  owner: "Engineering",
  job: "Plans package upgrades with risk, tests, and rollback steps.",
  rule: "Prefer small reversible upgrade batches.",
  tags: ["engineering","dependencies"],
} as const;
