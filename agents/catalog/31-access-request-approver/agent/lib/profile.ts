// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "31-access-request-approver",
  title: "Access request approver",
  owner: "Security",
  job: "Checks access requests against least-privilege policy and requires approval.",
  rule: "Any grant is a side effect and must use approval.",
  tags: ["security","iam"],
} as const;
