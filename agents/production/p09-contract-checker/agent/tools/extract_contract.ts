import { defineTool } from "eve/tools";
import { run } from "@eve-catalog/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/contract-extract";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description:
    "Extract parties, dates, obligations, payment terms, liability caps, termination from a contract. " +
    "Not legal advice. Paid (~$0.011).",
  inputSchema: z
    .object({
      text: z.string().optional(),
      pdf_url: z.string().url().optional(),
      base64: z.string().optional(),
    })
    .refine((v) => Boolean(v.text || v.pdf_url || v.base64), {
      message: "Provide text, pdf_url, or base64",
    }),
  async execute({ text, pdf_url, base64 }) {
    const input: Record<string, string> = {};
    if (text) input.text = text;
    if (pdf_url) input.pdf_url = pdf_url;
    if (base64) input.base64 = base64;
    return run({ provider: PROVIDER, endpoint: ENDPOINT, input, price: PRICE });
  },
});