// Generated from scripts/generate-real-world-archetypes.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "21-market-news-briefing",
  title: "Market/news briefing",
  owner: "Strategy",
  job: "Generates daily sector brief with confidence and source gaps.",
  rule: "Use concise bullets with impact and confidence.",
  tags: ["news","schedule"],
} as const;
