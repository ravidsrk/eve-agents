// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "23-invoice-anomaly-auditor",
  title: "Invoice anomaly auditor",
  owner: "Finance Ops",
  job: "Flags suspicious invoices and missing approvals.",
  rule: "Do not accuse fraud; state anomaly evidence and review steps.",
  tags: ["finance","audit"],
} as const;
