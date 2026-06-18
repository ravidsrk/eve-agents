import { defineTool } from "eve/tools";
import { run } from "@lab/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/pdf-extract";
const PRICE = { type: "PER_CALL", amount: 0.033, currency: "USD" };

export default defineTool({
  description:
    "Extract structured text and tables from any PDF via URL. Use for non-invoice documents. Paid (~$0.033).",
  inputSchema: z.object({
    url: z.string().url().describe("Public URL to PDF document"),
    extract: z
      .string()
      .optional()
      .describe("What to extract in natural language, e.g. 'all tables and key metrics'"),
  }),
  async execute({ url, extract }) {
    const input: Record<string, string> = { url };
    if (extract) input.extract = extract;
    return run({ provider: PROVIDER, endpoint: ENDPOINT, input, price: PRICE });
  },
});