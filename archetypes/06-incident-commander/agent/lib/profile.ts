// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "06-incident-commander",
  title: "Incident commander",
  owner: "SRE",
  job: "Builds an incident timeline and next-action checklist from alerts/logs.",
  rule: "Prioritize containment, customer impact, owner, and next update time.",
  tags: ["incident","sre"],
} as const;
