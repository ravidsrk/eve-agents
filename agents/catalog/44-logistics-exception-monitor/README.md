# Logistics exception monitor

## Rationale

Logistics exception monitor is a real-world eve archetype for Logistics.

Mission: Explains delayed shipments and proposes mitigation.

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

## Run locally

```bash
bash ../../scripts/run-catalog-agent.sh agents/catalog/44-logistics-exception-monitor 3244 "Review the current logistics exception monitor queue and write a prioritized action report."
```

Secrets: repo-root `.secrets/eve.env` (see `bash scripts/setup.sh` from monorepo root).

- `OPENROUTER_API_KEY` — model inference
- `SUPERSERVE_API_KEY` — sandbox tools (optional for read-only turns)

## Deploy on Vercel

```bash
npm run deploy:catalog -- 44-logistics-exception-monitor
```

Set `ROUTE_AUTH_BASIC_USER` + `ROUTE_AUTH_BASIC_PASSWORD` on the Vercel project. Inference uses AI Gateway OIDC — no OpenRouter key on Vercel.

See [docs/DEPLOY.md](../../../docs/DEPLOY.md) and [docs/SECURITY.md](../../../docs/SECURITY.md).

## Tools and data

- `load_dossier`: loads `agent/data/dossier.json`.
- `search_records`: searches `agent/data/records.json`.
- `analyze_records`: scores local records for risk and opportunity.
- `write_report`: writes a markdown artifact under `.agent-artifacts/`.
- `record_decision`: approval-gated simulated side effect.
- `fetch_live_json`: guarded HTTPS JSON fetch, disabled unless `ALLOW_EXTERNAL_FETCH=1`.

## Sample prompt

> Review the current logistics exception monitor queue and write a prioritized action report.

## Expected behavior

The agent should load the dossier, inspect records, identify the highest-priority item, state
assumptions and uncertainty, and write a report. For any action that changes an external system, it
must use `record_decision`, which pauses for human approval.

## Verify

```bash
npm run verify:catalog
cd agents/catalog/44-logistics-exception-monitor && npx eve eval --strict   # needs keys in .secrets/eve.env
```

- Deterministic fixtures: `agent/data/dossier.json`, `agent/data/records.json`
- Smoke eval: `evals/smoke-dossier.eval.ts`
- Layer guide: [agents/catalog/README.md](../README.md)

## Domain rule

Name the bottleneck, customer impact, and mitigation owner.

## Tags

logistics, shipments
