import { defineTool } from "eve/tools";
import { run } from "@eve-catalog/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/sql-optimize";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description: "Analyze and optimize a SQL query for performance. Paid (~$0.011).",
  inputSchema: z.object({
    sql: z.string().min(1),
    dialect: z.enum(["postgres", "mysql", "sqlite", "mssql"]).optional().default("postgres"),
  }),
  async execute({ sql, dialect }) {
    return run({ provider: PROVIDER, endpoint: ENDPOINT, query: { sql, dialect }, price: PRICE });
  },
});