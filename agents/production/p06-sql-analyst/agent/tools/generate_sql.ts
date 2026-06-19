import { defineTool } from "eve/tools";
import { run } from "@eve-catalog/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/sql-generate";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description:
    "Generate SQL from natural language. Pass table_schema for best results (see agent/workspace/schema.sql). " +
    "Paid (~$0.011).",
  inputSchema: z.object({
    natural_language_query: z.string().min(1),
    dialect: z.enum(["postgres", "mysql", "sqlite", "mssql"]).optional().default("postgres"),
    table_schema: z.string().optional().describe("DDL or schema description"),
  }),
  async execute({ natural_language_query, dialect, table_schema }) {
    const query: Record<string, string> = { natural_language_query, dialect };
    if (table_schema) query.table_schema = table_schema;
    return run({ provider: PROVIDER, endpoint: ENDPOINT, query, price: PRICE });
  },
});