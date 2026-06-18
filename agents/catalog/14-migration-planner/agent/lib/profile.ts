// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "14-migration-planner",
  title: "Migration planner",
  owner: "Engineering",
  job: "Converts legacy API/code inventory into an execution plan.",
  rule: "Stage migrations by blast radius and rollback availability.",
  tags: ["migration","planning"],
} as const;
