import { defineTool } from "eve/tools";
import { run } from "@lab/monid-tools";
import { z } from "zod";

const PROVIDER = "pdl";
const ENDPOINT = "/v5/company/enrich";
const PRICE = { type: "PER_CALL", amount: 0.1, currency: "USD" };

export default defineTool({
  description:
    "Enrich a company by name, website, LinkedIn, or ticker via People Data Labs. Paid (~$0.10).",
  inputSchema: z.object({
    name: z.string().optional(),
    website: z.string().optional(),
    profile: z.string().optional().describe("LinkedIn company URL"),
    ticker: z.string().optional(),
  }),
  async execute(fields) {
    const input = Object.fromEntries(Object.entries(fields).filter(([, v]) => v != null && v !== ""));
    if (Object.keys(input).length === 0) {
      throw new Error("Provide at least one of: name, website, profile, ticker");
    }
    return run({ provider: PROVIDER, endpoint: ENDPOINT, input, price: PRICE });
  },
});