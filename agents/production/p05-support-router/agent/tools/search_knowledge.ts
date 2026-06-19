import { defineTool } from "eve/tools";
import { run } from "@eve-catalog/monid-tools";
import { z } from "zod";

const PROVIDER = "blockrun.ai";
const ENDPOINT = "/api/v1/exa/search";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description:
    "Search public web/docs for answers relevant to a support ticket (help articles, status pages, forums). " +
    "Paid (~$0.011). Use small numResults (5).",
  inputSchema: z.object({
    query: z.string().min(1).describe("Focused search query derived from the ticket"),
    numResults: z.number().int().min(1).max(10).optional().default(5),
  }),
  async execute({ query, numResults }) {
    return run({
      provider: PROVIDER,
      endpoint: ENDPOINT,
      input: { query, numResults },
      price: PRICE,
    });
  },
});