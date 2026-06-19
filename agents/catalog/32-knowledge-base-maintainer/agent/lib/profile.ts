// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "32-knowledge-base-maintainer",
  title: "Knowledge base maintainer",
  owner: "Support Ops",
  job: "Finds KB gaps from recurring tickets and drafts article updates.",
  rule: "Prefer new article/update/delete recommendations with evidence.",
  tags: ["kb","support"],
} as const;
