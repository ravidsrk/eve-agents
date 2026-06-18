import { defineTool } from "eve/tools";
import { z } from "zod";

// Static demo rates relative to USD.
const RATES: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 156.3, INR: 83.4 };

export default defineTool({
  description: "Convert an amount from one currency to another using static demo rates.",
  inputSchema: z.object({
    amount: z.number(),
    from: z.enum(["USD", "EUR", "GBP", "JPY", "INR"]),
    to: z.enum(["USD", "EUR", "GBP", "JPY", "INR"]),
  }),
  async execute({ amount, from, to }) {
    const usd = amount / RATES[from];
    const converted = usd * RATES[to];
    return { amount, from, to, result: Math.round(converted * 100) / 100, rate: RATES[to] / RATES[from] };
  },
});
