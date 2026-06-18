import { defineTool } from "eve/tools";
import { run } from "@lab/monid-tools";
import { z } from "zod";

const PROVIDER = "pdl";
const ENDPOINT = "/v5/person/enrich";
const PRICE = { type: "PER_CALL", amount: 0.3, currency: "USD" };

export default defineTool({
  description:
    "Enrich a person by email, phone, name, or LinkedIn via People Data Labs. Paid (~$0.30).",
  inputSchema: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    profile: z.string().optional().describe("LinkedIn profile URL"),
    company: z.string().optional(),
  }),
  async execute(fields) {
    const input = Object.fromEntries(Object.entries(fields).filter(([, v]) => v != null && v !== ""));
    if (Object.keys(input).length === 0) {
      throw new Error("Provide at least one identifier (email, phone, name, profile)");
    }
    return run({ provider: PROVIDER, endpoint: ENDPOINT, input, price: PRICE });
  },
});