import { defineTool } from "eve/tools";
import { run } from "@eve-catalog/monid-tools";
import { z } from "zod";

const PROVIDER = "api.strale.io";
const ENDPOINT = "/x402/code-review";
const PRICE = { type: "PER_CALL", amount: 0.237601, currency: "USD" };

export default defineTool({
  description:
    "AI code review on a diff or file snippet. Returns issues with severity, line hints, and fixes. " +
    "Focus: security, performance, readability, bugs, or all. Paid Monid call (~$0.24).",
  inputSchema: z.object({
    code: z.string().min(1).describe("Source code or unified diff to review"),
    focus: z
      .enum(["security", "performance", "readability", "bugs", "all"])
      .optional()
      .default("all"),
    language: z.string().optional().describe("Language hint, e.g. typescript, python"),
  }),
  async execute({ code, focus, language }) {
    const input: Record<string, string> = { code, focus };
    if (language) input.language = language;
    return run({ provider: PROVIDER, endpoint: ENDPOINT, input, price: PRICE });
  },
});