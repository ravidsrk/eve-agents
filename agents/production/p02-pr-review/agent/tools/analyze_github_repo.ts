import { defineTool } from "eve/tools";
import { run } from "@eve-catalog/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/github-repo-analyze";
const PRICE = { type: "PER_CALL", amount: 0.059401, currency: "USD" };

export default defineTool({
  description:
    "Analyze a public GitHub repository: tech stack, docs quality, activity, bus factor, health score. " +
    "Paid Monid call (~$0.06).",
  inputSchema: z.object({
    url: z.string().url().describe("GitHub repo URL, e.g. https://github.com/vercel/eve"),
  }),
  async execute({ url }) {
    return run({ provider: PROVIDER, endpoint: ENDPOINT, query: { url }, price: PRICE });
  },
});