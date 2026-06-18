import { defineOpenAPIConnection } from "eve/connections";

// Inline OpenAPI 3 spec for the Frankfurter FX API (live, no auth, reliable).
// The operation becomes connection__fx__getLatestRates, discoverable via connection__search.
export default defineOpenAPIConnection({
  description: "Frankfurter foreign-exchange rates: latest market rates for a base currency.",
  baseUrl: "https://api.frankfurter.dev/v1",
  spec: {
    openapi: "3.0.0",
    info: { title: "Frankfurter FX", version: "1.0.0" },
    servers: [{ url: "https://api.frankfurter.dev/v1" }],
    paths: {
      "/latest": {
        get: {
          operationId: "getLatestRates",
          summary: "Get the latest FX rates for a base currency.",
          parameters: [
            {
              name: "base",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Base currency code, e.g. USD",
            },
            {
              name: "symbols",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Comma-separated target currency codes, e.g. EUR,GBP,JPY",
            },
          ],
          responses: { "200": { description: "Latest rates" } },
        },
      },
    },
  },
});
