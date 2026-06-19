// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "27-privacy-dsr-responder",
  title: "Privacy DSR responder",
  owner: "Privacy",
  job: "Builds data-subject request task plans without exposing sensitive data.",
  rule: "Minimize personal data and use placeholders in reports.",
  tags: ["privacy","dsr"],
} as const;
