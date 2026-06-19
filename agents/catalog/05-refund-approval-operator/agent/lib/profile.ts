// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "05-refund-approval-operator",
  title: "Refund approval operator",
  owner: "Support Ops",
  job: "Applies refund policy and gates side-effecting refunds behind HITL approval.",
  rule: "Use record_decision only after the policy decision is clear.",
  tags: ["support","approvals"],
} as const;
