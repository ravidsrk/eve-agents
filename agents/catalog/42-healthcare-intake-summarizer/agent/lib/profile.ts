// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "42-healthcare-intake-summarizer",
  title: "Healthcare intake summarizer",
  owner: "Healthcare Ops",
  job: "Summarizes intake for staff without diagnosis or treatment advice.",
  rule: "No diagnosis, treatment, or medication advice.",
  tags: ["healthcare","intake"],
} as const;
