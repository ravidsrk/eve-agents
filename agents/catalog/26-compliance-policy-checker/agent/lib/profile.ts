// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "26-compliance-policy-checker",
  title: "Compliance policy checker",
  owner: "Compliance",
  job: "Checks proposed actions against a controls matrix.",
  rule: "Map every concern to a named control.",
  tags: ["compliance","controls"],
} as const;
