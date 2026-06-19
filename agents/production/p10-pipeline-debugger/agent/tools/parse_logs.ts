import { defineTool } from "eve/tools";
import { run } from "@eve-catalog/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/log-parse";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description: "Parse ETL/job logs. Paid (~$0.011).",
  inputSchema: z.object({ logs: z.string().min(1) }),
  async execute({ logs }) {
    return run({ provider: PROVIDER, endpoint: ENDPOINT, query: { logs }, price: PRICE });
  },
});