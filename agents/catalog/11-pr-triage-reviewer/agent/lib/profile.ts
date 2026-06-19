// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "11-pr-triage-reviewer",
  title: "PR triage reviewer",
  owner: "Engineering",
  job: "Summarizes diffs, labels risk, and suggests reviewers.",
  rule: "Credit the Vercel PR triage template pattern in the README.",
  tags: ["github","review"],
} as const;
