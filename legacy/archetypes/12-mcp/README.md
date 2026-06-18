# 12 · MCP-Consuming Agent (Monid remote MCP)

**Rationale.** Consume an external **MCP server** through eve's `defineMcpClientConnection`. Points
at Monid's remote MCP (`https://mcp.monid.ai/v1`, Streamable HTTP) with the API key sent as a Bearer
token the model never sees. Monid's tools surface as `connection__monid__*`, found via
`connection__search`. Complements archetype 02 (which used Monid's HTTP API via authored tools).

**Stack.** OpenRouter `openai/gpt-oss-120b` · Monid MCP · no sandbox.

## Run
```bash
bash run_archetype.sh archetypes/12-mcp 3124 "Discover Monid endpoints for tweets; list 3 with prices. Don't run paid ones."
```

## Proof (see `run.log`)
`connection__search` → `connection__monid__monid_discover("twitter posts")` returned live endpoints;
agent listed 3 with per-call prices (TikHub `fetch_user_post_tweet` $0.0015, BlockRun
`search/social/posts` $0.00825, TikHub `fetch_latest_post_comments` $0.0015). No paid run executed.
Verified the MCP `initialize` handshake accepts the Bearer key (`serverInfo: monid 1.0.1`).

## Note on budget
The MCP path is driven by eve directly, so it bypasses `@lab/monid-tools`' USD budget guard — these
agents are instructed to use only the free `discover`/`inspect` MCP tools. Use archetype 02's
authored-tool path when you need the enforced budget cap on paid runs.

## Cost notes
$0.00 (discovery only). ~few k tokens.
