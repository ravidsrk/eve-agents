// Ready-made eve tools wrapping the Monid client. Re-export the ones you need from
// an archetype's agent/tools/<name>.ts so the filename sets the tool name, e.g.:
//
//   // agent/tools/monid_discover.ts
//   export { monidDiscoverTool as default } from "@lab/monid-tools/tools";

import { defineTool } from "eve/tools";
import { z } from "zod";
import { discover, inspect, run, walletBalance } from "./index.js";

export const monidDiscoverTool = defineTool({
  description:
    "Discover live external data/tool endpoints via Monid using a natural-language query. " +
    "Returns matching providers, endpoints, descriptions, and per-call pricing. Free to call.",
  inputSchema: z.object({
    query: z.string().min(1).describe("Natural-language description of the data/tool you need"),
    limit: z.number().int().min(1).max(20).optional().default(5),
  }),
  async execute({ query, limit }) {
    const res = await discover(query, limit);
    return res;
  },
});

export const monidInspectTool = defineTool({
  description:
    "Inspect a Monid endpoint discovered via monid_discover: full input schema, docs, and pricing. Free.",
  inputSchema: z.object({
    provider: z.string().min(1),
    endpoint: z.string().min(1),
  }),
  async execute({ provider, endpoint }) {
    return inspect(provider, endpoint);
  },
});

export const monidRunTool = defineTool({
  description:
    "Run a Monid endpoint to fetch live external data. This is a PAID call; it is refused if it " +
    "would exceed the configured per-call or total USD budget. Pass the price object from " +
    "monid_discover/monid_inspect so the budget guard can enforce caps.",
  inputSchema: z.object({
    provider: z.string().min(1),
    endpoint: z.string().min(1),
    input: z.record(z.string(), z.unknown()).default({}),
    price: z
      .object({
        type: z.string().optional(),
        amount: z.number().optional(),
        currency: z.string().optional(),
      })
      .optional(),
  }),
  async execute({ provider, endpoint, input, price }) {
    return run({ provider, endpoint, input, price });
  },
});

export const monidWalletTool = defineTool({
  description: "Check the Monid wallet balance (USD).",
  inputSchema: z.object({}),
  async execute() {
    return walletBalance();
  },
});
