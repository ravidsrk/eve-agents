# Revenue analyst

## Rationale

Revenue analyst is a real-world eve archetype for Finance.

Mission: Answers KPI/revenue questions from a warehouse extract and explains assumptions.

This is not a toy feature demo: it has a bounded user, local operational records, a playbook skill,
approval-gated side effects, and report output.

## Template shape

This archetype follows the official Eve template layout:

- root `AGENTS.md`, `CLAUDE.md`, `.env.example`, and `.vercelignore`,
- `agent/agent.ts` for model/runtime configuration,
- `agent/channels/eve.ts` for the default authenticated Eve HTTP/TUI channel,
- `agent/instructions.md` for always-on behavior,
- `agent/skills/operating-playbook/SKILL.md` for domain procedure,
- `agent/lib/profile.ts` for reusable static metadata,
- `agent/tools/*.ts` for typed tools,
- `agent/sandbox/sandbox.ts` for SuperServe-backed execution.

## Run

```bash
bash ../../scripts/run-catalog-agent.sh agents/catalog/01-revenue-analyst 3201 "Review the current revenue analyst queue and write a prioritized action report."
```

Requires:

- `OPENROUTER_API_KEY` for model inference.
- `SUPERSERVE_API_KEY` for sandbox-backed eve file/code execution.
- Optional valid `MONID_API_KEY` for live external research in follow-up work.

## Tools and data

- `load_dossier`: loads `agent/data/dossier.json`.
- `run_aggregate`: sums/averages recognized revenue from `agent/data/revenue.csv`.
- `search_records`: searches `agent/data/records.json`.
- `analyze_records`: scores local records for risk and opportunity.
- `write_report`: writes a markdown artifact under `.agent-artifacts/`.
- `record_decision`: approval-gated simulated side effect.
- `fetch_live_json`: guarded HTTPS JSON fetch, disabled unless `ALLOW_EXTERNAL_FETCH=1`.

## Sample prompt

> Review the current revenue analyst queue and write a prioritized action report.

## Expected behavior

The agent should load the dossier, inspect records, identify the highest-priority item, state
assumptions and uncertainty, and write a report. For any action that changes an external system, it
must use `record_decision`, which pauses for human approval.

## Deploy on Vercel

S-tier showcase — dual-track via `@eve-catalog/profile`. Sandbox optional for ad-hoc bash; KPI answers use `run_aggregate` on seeded CSV.

## Evidence status

- Warehouse extract: `agent/data/revenue.csv`.
- Evals: `evals/smoke-dossier.eval.ts`, `evals/revenue-aggregate.eval.ts`.

## Domain rule

Use the revenue recognition skill before answering revenue questions.

## Tags

finance, analytics
