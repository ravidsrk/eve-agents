import { readFileSync } from "node:fs";
import path from "node:path";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "List specialized subagents in the fleet registry with tags and descriptions.",
  inputSchema: z.object({
    tag: z.string().optional().describe("Optional tag filter, e.g. sales or support."),
  }),
  async execute({ tag }) {
    const file = path.join(process.cwd(), "agent/data/registry.json");
    const registry = JSON.parse(readFileSync(file, "utf8")) as {
      routes: Array<{ id: string; tags: string[]; description: string }>;
    };
    let routes = registry.routes;
    if (tag) {
      const q = tag.toLowerCase();
      routes = routes.filter((r) => r.tags.some((t) => t.includes(q)) || r.id.includes(q));
    }
    return { count: routes.length, routes };
  },
});