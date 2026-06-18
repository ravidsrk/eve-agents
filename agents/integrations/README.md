# Integrations

v1 **integration proofs** — not product agents. Kept for harnesses, fixtures, and patterns that
the main catalog does not cover yet.

**Do not extend.** Use [`catalog/`](../catalog/) or [`production/`](../production/) for new work.

## When to open this folder

| Need | Agent | Command |
| --- | --- | --- |
| HITL approval harness | `08-hitl` | `npm run test:hitl` |
| Durable session resume | `11-durable-resume` | `npm run test:durable` |
| Network deny-all proof | `22-security` | `npm run test:robustness` |
| Slack + Vercel Connect | `10-slack` | see agent README |
| Monid MCP (not HTTP) | `12-mcp` | see agent README |
| Parallel SuperServe VMs | `20-swarm` | `swarm_run.ts` |
| Local streaming web UI | `19-web-ui` | `web/serve.mjs` |
| Self-verifying answers | `16-eval-self` | see agent README |
| Minimal sandbox smoke | `01-data-analyst` | see agent README |

## Fixtures extracted into catalog

| Integration | Asset | Now in |
| --- | --- | --- |
| `18-rag` | `kb/*.txt` | `catalog/33-rag-support-search/.../kb/` |
| `04-pdf-qa` | `report.pdf` | `catalog/40-pdf-due-diligence-analyst/.../docs/` |
| `01-data-analyst` | `sales.csv` | `catalog/39-code-interpreter-analyst/.../data/` |

Full reuse matrix: [AGENT_CATALOG.md § Integrations](../../AGENT_CATALOG.md#integrations-agentsintegrations).