# Production agents (Layer P)

Ten **Monid-integrated deep agents** with custom domain tools. Each pairs with catalog agents in [AGENT_CATALOG.md](../../AGENT_CATALOG.md) but adds live external APIs and specialized logic.

## Agents

| Agent | Port | Catalog peers | Focus |
| --- | ---: | --- | --- |
| [p01-incident-triage](p01-incident-triage/) | 3301 | A06 | Log parse, error explain, postmortem |
| [p02-pr-review](p02-pr-review/) | 3302 | A11, A12 | Repo analysis, code review, PR text |
| [p03-competitive-intel](p03-competitive-intel/) | 3303 | A20, A21 | Web search digest |
| [p04-invoice-extractor](p04-invoice-extractor/) | 3304 | A23, A40 | Invoice/PDF extraction |
| [p05-support-router](p05-support-router/) | 3305 | A04, A33 | Ticket classify + draft reply |
| [p06-sql-analyst](p06-sql-analyst/) | 3306 | A01, A22 | NL → SQL (seeded `schema.sql`) |
| [p07-runbook-executor](p07-runbook-executor/) | 3307 | A07 | Ops runbooks + HITL |
| [p08-lead-enricher](p08-lead-enricher/) | 3308 | A02 | PDL company/person enrich |
| [p09-contract-checker](p09-contract-checker/) | 3309 | A25, A26 | Contract extract + policy flags |
| [p10-pipeline-debugger](p10-pipeline-debugger/) | 3310 | A15, A37 | ETL log debug |

## Runtime

- **Model:** `resolveModel()` from `@eve-catalog/profile` (same dual-track as catalog)
- **Auth:** each agent ships `agent/channels/eve.ts` with `routeAuth()`
- **Monid:** custom tools call `@eve-catalog/monid-tools` when `MONID_API_KEY` is set

Budget defaults: `MONID_BUDGET_USD=5`, `MONID_MAX_CALL_USD=0.25`. See [docs/COST-RUNBOOK.md](../../docs/COST-RUNBOOK.md).

## Run

```bash
bash scripts/setup.sh
bash scripts/run-production-agent.sh p06-sql-analyst 3306 "Explain slow queries in schema.sql"
npm run smoke:production          # live Monid smoke (P01–P03)
npm run run:production:all        # batch all 10 (needs keys + quota)
npm run smoke:production:build    # eve build all P01–P10 (keyless)
```

Single agent dev server:

```bash
cd agents/production/p01-incident-triage && npx eve dev --no-ui --port 3301
```

## Scaffold new production agent

```bash
bash scripts/scaffold-production-agent.sh p11-my-agent "My Agent" 3311
```

Scaffold emits `resolveModel`, `@eve-catalog/profile`, and `agent/channels/eve.ts`.