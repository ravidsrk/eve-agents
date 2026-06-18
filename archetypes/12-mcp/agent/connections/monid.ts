import { defineMcpClientConnection } from "eve/connections";

// Monid's remote MCP server (Streamable HTTP). The API key is sent as a Bearer token and never
// reaches the model. Its tools appear to the model as connection__monid__<tool>
// (monid_discover, monid_inspect, monid_run), discoverable via connection__search.
export default defineMcpClientConnection({
  url: "https://mcp.monid.ai/v1",
  description:
    "Monid tool router: discover, inspect, and run hundreds of live data endpoints (web scraping, " +
    "search, social, enrichment). Discovery and inspection are free; running costs money.",
  auth: {
    getToken: async () => ({ token: process.env.MONID_API_KEY! }),
  },
});
