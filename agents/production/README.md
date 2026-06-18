# Production agents (Tier 2)

Real-world agents from [AGENT_CATALOG.md](../../AGENT_CATALOG.md) + Monid research.

| Agent | Port | Focus |
|-------|------|-------|
| [p01-incident-triage](./p01-incident-triage/) | 3301 | Log parse, error explain, postmortem |
| [p02-pr-review](./p02-pr-review/) | 3302 | Repo analysis, code review, PR text |
| [p03-competitive-intel](./p03-competitive-intel/) | 3303 | Web search digest |
| [p04-invoice-extractor](./p04-invoice-extractor/) | 3304 | Invoice/PDF extraction |
| [p05-support-router](./p05-support-router/) | 3305 | Ticket classify + draft reply |
| [p06-sql-analyst](./p06-sql-analyst/) | 3306 | NL → SQL |
| [p07-runbook-executor](./p07-runbook-executor/) | 3307 | Ops runbooks + HITL |
| [p08-lead-enricher](./p08-lead-enricher/) | 3308 | PDL company/person enrich |
| [p09-contract-checker](./p09-contract-checker/) | 3309 | Contract extract + policy flags |
| [p10-pipeline-debugger](./p10-pipeline-debugger/) | 3310 | ETL log debug |

```bash
bash scripts/setup.sh
npm run smoke:production   # live Monid smoke (P01–P03)
cd agents/production/p01-incident-triage && npx eve dev --no-ui --port 3301
```