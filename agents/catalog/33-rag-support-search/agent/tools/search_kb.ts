import { readFileSync } from "node:fs";
import path from "node:path";
import { defineTool } from "eve/tools";
import { z } from "zod";

type Article = {
  id: string;
  title: string;
  source: string;
  summary: string;
  body: string;
  tags: string[];
};

function loadArticles(): Article[] {
  const file = path.join(process.cwd(), "agent/kb/articles.json");
  return JSON.parse(readFileSync(file, "utf8"));
}

export default defineTool({
  description: "Retrieve grounded support answers from the local document corpus with source ids.",
  inputSchema: z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(10).default(3),
  }),
  async execute({ query, limit }) {
    const articles = loadArticles();
    const q = query.toLowerCase();
    const matches = articles
      .filter((a) => JSON.stringify(a).toLowerCase().includes(q))
      .slice(0, limit)
      .map((a) => ({
        id: a.id,
        title: a.title,
        source: a.source,
        summary: a.summary,
        excerpt: a.body.slice(0, 200),
      }));
    return { query, count: matches.length, articles: matches };
  },
});