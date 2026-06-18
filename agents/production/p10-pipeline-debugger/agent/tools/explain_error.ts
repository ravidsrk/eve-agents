import { defineTool } from "eve/tools";
import { run } from "@lab/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/error-explain";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description: "Explain pipeline errors/stack traces. Paid (~$0.011).",
  inputSchema: z.object({
    error: z.string().min(1),
    language: z.string().optional(),
    context: z.string().optional(),
  }),
  async execute({ error, language, context }) {
    const query: Record<string, string> = { error };
    if (language) query.language = language;
    if (context) query.context = context;
    return run({ provider: PROVIDER, endpoint: ENDPOINT, query, price: PRICE });
  },
});