// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "07-oncall-runbook-executor",
  title: "On-call runbook executor",
  owner: "SRE",
  job: "Executes safe diagnostics and writes an operator handoff.",
  rule: "Diagnostics are read-only unless a human approves a side effect.",
  tags: ["sre","runbook"],
} as const;
