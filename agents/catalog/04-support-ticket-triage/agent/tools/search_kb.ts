import { readFileSync } from "node:fs";
import path from "node:path";
import { defineTool } from "eve/tools";
import { z } from "zod";

function loadArticles() {
  const file = path.join(process.cwd(), "agent/kb/articles.json");
  return JSON.parse(readFileSync(file, "utf8")) as Array<{
    id: string;
    title: string;
    category: string;
    summary: string;
    body: string;
    tags: string[];
  }>;
}

function matchesQuery(article: Record<string, unknown>, query: string): boolean {
  return JSON.stringify(article).toLowerCase().includes(query.toLowerCase());
}

export default defineTool({
  description: "Search the local knowledge base for support playbooks, escalation rules, and how-to articles.",
  inputSchema: z.object({
    query: z.string().min(1).describe("Free-text search across KB titles, summaries, and tags."),
    limit: z.number().int().min(1).max(20).default(5),
  }),
  async execute({ query, limit }) {
    const articles = loadArticles();
    const matches = articles.filter((article) => matchesQuery(article, query)).slice(0, limit);
    return { query, count: matches.length, articles: matches };
  },
});