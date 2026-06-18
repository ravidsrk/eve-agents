// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "50-agent-fleet-router",
  title: "Agent fleet router",
  owner: "Operations",
  job: "Routes incoming tasks to the right specialized agent and explains why.",
  rule: "Use the registry before choosing a route.",
  tags: ["routing","fleet"],
} as const;
