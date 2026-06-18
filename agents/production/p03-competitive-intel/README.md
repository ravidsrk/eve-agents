# P03 — Competitive intel digest

Research agent: live web search + grounded answers for competitor monitoring digests.

## Monid endpoints

| Tool | Provider | Endpoint | ~Cost |
|------|----------|----------|-------|
| `web_search` | blockrun.ai | `/api/v1/exa/search` | $0.011 |
| `web_answer` | blockrun.ai | `/api/v1/exa/answer` | $0.011 |

Discovered via `npm run research:monid` (queries: "competitive intelligence", "web scraping research summarize").

## Run

```bash
bash scripts/setup.sh
cd agents/production/p03-competitive-intel
npx eve dev --no-ui --port 3303
```

Example: *"Weekly digest: Vercel vs Netlify — product and pricing news from the last 7 days."*