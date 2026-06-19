import { defineTool } from "eve/tools";
import { run } from "@eve-agents/monid-tools";
import { z } from "zod";

const PROVIDER = "blockrun.ai";
const ENDPOINT = "/api/v1/exa/answer";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description:
    "Draft a support reply grounded in live web search. Pass the customer question plus product context. " +
    "Paid (~$0.011).",
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .describe(
        "Full prompt, e.g. 'Customer cannot reset password on Acme app v2. Draft a helpful support reply with steps.'",
      ),
  }),
  async execute({ query }) {
    return run({ provider: PROVIDER, endpoint: ENDPOINT, input: { query }, price: PRICE });
  },
});