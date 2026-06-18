import { defineTool } from "eve/tools";
import { run } from "@lab/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/pr-description-generate";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description:
    "Generate a pull request title, summary, change list, and testing steps from a unified diff. " +
    "Paid Monid call (~$0.011).",
  inputSchema: z.object({
    diff: z.string().min(1).describe("Unified diff or commit patch"),
    title: z.string().optional().describe("Optional working title"),
  }),
  async execute({ diff, title }) {
    const query: Record<string, string> = { diff };
    if (title) query.title = title;
    return run({ provider: PROVIDER, endpoint: ENDPOINT, query, price: PRICE });
  },
});