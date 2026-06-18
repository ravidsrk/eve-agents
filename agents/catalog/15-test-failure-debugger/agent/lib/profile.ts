// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "15-test-failure-debugger",
  title: "Test failure debugger",
  owner: "Engineering",
  job: "Reads failing logs, identifies likely cause, and proposes a fix.",
  rule: "Never claim a fix without naming the validation command.",
  tags: ["testing","debugging"],
} as const;
