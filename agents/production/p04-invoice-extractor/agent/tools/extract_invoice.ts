import { defineTool } from "eve/tools";
import { run } from "@eve-agents/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/invoice-extract";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description:
    "Extract structured invoice/receipt data (vendor, line items, totals, VAT, dates) from a URL or base64 file. " +
    "Paid Monid call (~$0.011).",
  inputSchema: z
    .object({
      url: z.string().url().optional().describe("Public URL to invoice PDF or image"),
      base64: z.string().optional().describe("Base64-encoded invoice file"),
    })
    .refine((v) => Boolean(v.url || v.base64), { message: "Provide url or base64" }),
  async execute({ url, base64 }) {
    const input: Record<string, string> = {};
    if (url) input.url = url;
    if (base64) input.base64 = base64;
    return run({ provider: PROVIDER, endpoint: ENDPOINT, input, price: PRICE });
  },
});