import { defineTool } from "eve/tools";
import { run } from "@eve-agents/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/error-explain";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description:
    "Explain an error message or stack trace in plain English with root cause and fix suggestions. " +
    "Paid Monid call (~$0.011).",
  inputSchema: z.object({
    error: z.string().min(1).describe("Error message or stack trace"),
    language: z.string().optional().describe("Programming language context, e.g. python, go"),
    context: z.string().optional().describe("Extra context (service name, recent deploy, etc.)"),
  }),
  async execute({ error, language, context }) {
    const query: Record<string, string> = { error };
    if (language) query.language = language;
    if (context) query.context = context;
    return run({ provider: PROVIDER, endpoint: ENDPOINT, query, price: PRICE });
  },
});