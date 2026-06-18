// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "13-release-notes-drafter",
  title: "Release notes drafter",
  owner: "Product Marketing",
  job: "Turns merged changes into customer-facing release notes.",
  rule: "Separate customer-facing notes from internal implementation details.",
  tags: ["release","content"],
} as const;
