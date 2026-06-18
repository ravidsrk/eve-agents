// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "44-logistics-exception-monitor",
  title: "Logistics exception monitor",
  owner: "Logistics",
  job: "Explains delayed shipments and proposes mitigation.",
  rule: "Name the bottleneck, customer impact, and mitigation owner.",
  tags: ["logistics","shipments"],
} as const;
