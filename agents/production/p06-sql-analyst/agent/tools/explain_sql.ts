import { defineTool } from "eve/tools";
import { run } from "@eve-agents/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/sql-explain";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description: "Explain a SQL query in plain English. Paid (~$0.011).",
  inputSchema: z.object({
    sql: z.string().min(1),
  }),
  async execute({ sql }) {
    return run({ provider: PROVIDER, endpoint: ENDPOINT, query: { sql }, price: PRICE });
  },
});