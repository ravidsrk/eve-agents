// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "33-rag-support-search",
  title: "RAG support search",
  owner: "Support",
  job: "Retrieves grounded support answers from a document set.",
  rule: "Quote document titles/ids and say when the answer is not in the corpus.",
  tags: ["rag","support"],
} as const;
