# Agents

Working eve agents for real-world patterns. Two tiers:

## `official/` — ported from [vercel/eve](https://github.com/vercel/eve)

Authoritative reference agents with upstream evals. Ported with:

- OpenRouter inference (`@lab/openrouter`)
- SuperServe sandbox where the fixture needs real binaries (`agent-tools-sandbox`)

```bash
bash scripts/setup.sh
cd agents/official/agent-openapi-swagger
npx eve dev --no-ui --port 3201
npx eve eval --strict
```

Port another fixture:

```bash
bash scripts/port-eve-fixture.sh agent-tools-hitl
```

## `production/` — research-driven

Built from [AGENT_CATALOG.md](../AGENT_CATALOG.md) Tier 2 after Monid research (`npm run research:monid`).

| Agent | Pattern |
|-------|---------|
| `p01-incident-triage` | On-call log parse + error explain + postmortem draft |
| `p02-pr-review` | Repo analysis + AI code review + PR description |
| `p03-competitive-intel` | Live web search digest for competitor monitoring |
| `p04-invoice-extractor` | Invoice/PDF → structured JSON |
| `p05-support-router` | Ticket classify + grounded draft reply |
| `p06-sql-analyst` | NL → SQL with explain/optimize |
| `p07-runbook-executor` | Ops runbooks with HITL gates |
| `p08-lead-enricher` | PDL company/person CRM enrichment |
| `p09-contract-checker` | Contract extract + policy red flags |
| `p10-pipeline-debugger` | ETL failure log triage |

```bash
cd agents/production/p02-pr-review
npx eve dev --no-ui --port 3302
```