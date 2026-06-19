// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "46-inventory-replenishment-planner",
  title: "Inventory replenishment planner",
  owner: "Operations",
  job: "Recommends reorder actions from demand and lead time.",
  rule: "Explain stockout risk and carrying-cost tradeoff.",
  tags: ["inventory","planning"],
} as const;
