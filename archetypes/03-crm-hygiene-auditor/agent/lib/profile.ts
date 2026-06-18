// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "03-crm-hygiene-auditor",
  title: "CRM hygiene auditor",
  owner: "RevOps",
  job: "Finds duplicate accounts, stale owners, and missing lifecycle fields.",
  rule: "Never propose destructive CRM changes without approval.",
  tags: ["crm","operations"],
} as const;
