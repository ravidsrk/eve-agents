// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "04-support-ticket-triage",
  title: "Support ticket triage",
  owner: "Support",
  job: "Classifies tickets, finds likely answer paths, and escalates risk.",
  rule: "Escalate billing, legal, security, and data-loss tickets.",
  tags: ["support","triage"],
} as const;
