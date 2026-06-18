// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "16-documentation-qa",
  title: "Documentation QA",
  owner: "Developer Relations",
  job: "Audits docs for broken promises, stale commands, and missing prerequisites.",
  rule: "Mark each issue as factual bug, ambiguity, missing prerequisite, or stale example.",
  tags: ["docs","qa"],
} as const;
