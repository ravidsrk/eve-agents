import { defineTool } from "eve/tools";
import { run } from "@eve-agents/monid-tools";
import { z } from "zod";

const PROVIDER = "blockrun.ai";
const ENDPOINT = "/api/v1/exa/search";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description:
    "Neural web search for competitive intelligence. Optional category: news, company, github, etc. " +
    "Paid Monid call (~$0.011). Keep numResults small (5–10) to control cost.",
  inputSchema: z.object({
    query: z.string().min(1).describe("Search query, e.g. 'Acme Corp product launch 2026'"),
    numResults: z.number().int().min(1).max(20).optional().default(8),
    category: z
      .enum([
        "company",
        "research paper",
        "news",
        "pdf",
        "github",
        "tweet",
        "personal site",
        "linkedin profile",
        "financial report",
      ])
      .optional(),
    includeDomains: z.array(z.string()).optional(),
    excludeDomains: z.array(z.string()).optional(),
  }),
  async execute({ query, numResults, category, includeDomains, excludeDomains }) {
    const input: Record<string, unknown> = { query, numResults };
    if (category) input.category = category;
    if (includeDomains?.length) input.includeDomains = includeDomains;
    if (excludeDomains?.length) input.excludeDomains = excludeDomains;
    return run({ provider: PROVIDER, endpoint: ENDPOINT, input, price: PRICE });
  },
});