import { defineTool } from "eve/tools";
import { run } from "@eve-agents/monid-tools";
import { z } from "zod";

const PROVIDER = "blockrun.ai";
const ENDPOINT = "/api/v1/exa/answer";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description:
    "Answer a question grounded in live web search (good for executive summaries). " +
    "Paid Monid call (~$0.011).",
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .describe("Question to answer, e.g. 'What did Competitor X announce this week?'"),
  }),
  async execute({ query }) {
    return run({ provider: PROVIDER, endpoint: ENDPOINT, input: { query }, price: PRICE });
  },
});