import { defineTool } from "eve/tools";
import { run } from "@eve-catalog/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/log-parse";
const PRICE = { type: "PER_CALL", amount: 0.011, currency: "USD" };

export default defineTool({
  description:
    "Parse raw application logs (JSON, syslog, logfmt, Laravel). Returns timestamps, levels, " +
    "messages, and error/warning summary. Paid Monid call (~$0.011).",
  inputSchema: z.object({
    logs: z.string().min(1).describe("Raw log text from the incident"),
  }),
  async execute({ logs }) {
    return run({ provider: PROVIDER, endpoint: ENDPOINT, query: { logs }, price: PRICE });
  },
});