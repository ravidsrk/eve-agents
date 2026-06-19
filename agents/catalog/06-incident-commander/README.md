# Incident commander

## Rationale

Incident commander is a real-world eve archetype for SRE.

Mission: Builds an incident timeline and next-action checklist from alerts/logs.

This is not a toy feature demo: it has a bounded user, local operational records, a playbook skill,
approval-gated side effects, and report output.

## Template shape

This archetype follows the official Eve template layout:

- root `AGENTS.md`, `CLAUDE.md`, `.env.example`, and `.vercelignore`,
- `agent/agent.ts` for model/runtime configuration,
- `agent/channels/eve.ts` for the default authenticated Eve HTTP/TUI channel,
- `agent/channels/slack.ts` for Slack @mentions via Vercel Connect,
- `agent/channels/alert.ts` for incident alert ingestion webhooks,
- `agent/instructions.md` for always-on behavior,
- `agent/skills/operating-playbook/SKILL.md` for domain procedure,
- `agent/lib/profile.ts` for reusable static metadata,
- `agent/tools/*.ts` for typed tools,
- `agent/sandbox/sandbox.ts` for SuperServe-backed execution.
- `agent/schedules/digest.ts` for cron-triggered incident digests (Vercel Cron on deploy).

## Deploy on Vercel

**Production:** https://eve-incident-commander.vercel.app

```bash
npm run deploy:flagship
npm run smoke:deployed -- https://eve-incident-commander.vercel.app .
```

Set on the Vercel project:

- `ROUTE_AUTH_BASIC_USER` + `ROUTE_AUTH_BASIC_PASSWORD` — HTTP session access
- `ALERT_WEBHOOK_SECRET` — required for `POST /incident` (returns `401` without correct header)

On Vercel, inference uses AI Gateway OIDC (`@eve-catalog/profile`); no OpenRouter or SuperServe keys.

See [docs/DEPLOY.md](../../../docs/DEPLOY.md), [docs/CONNECT.md](../../../docs/CONNECT.md), [docs/SECURITY.md](../../../docs/SECURITY.md).

## Run

```bash
bash ../../scripts/run-catalog-agent.sh agents/catalog/06-incident-commander 3206 "Review the current incident commander queue and write a prioritized action report."
```

Requires repo-root `.secrets/eve.env` (see `bash scripts/setup.sh`):

- `OPENROUTER_API_KEY` for model inference
- `SUPERSERVE_API_KEY` for sandbox-backed execution

## Tools and data

- `load_dossier`: loads `agent/data/dossier.json`.
- `search_records`: searches `agent/data/records.json`.
- `analyze_records`: scores local records for risk and opportunity.
- `write_report`: writes a markdown artifact under `.agent-artifacts/`.
- `record_decision`: approval-gated simulated side effect.
- `record_digest`: scheduled digest tick (used by `digest` cron schedule).
- `fetch_live_json`: guarded HTTPS JSON fetch, disabled unless `ALLOW_EXTERNAL_FETCH=1`.

## Sample prompt

> Review the current incident commander queue and write a prioritized action report.

## Expected behavior

The agent should load the dossier, inspect records, identify the highest-priority item, state
assumptions and uncertainty, and write a report. For any action that changes an external system, it
must use `record_decision`, which pauses for human approval.

## Evidence status

- Deterministic fixtures: included in `agent/data/`.
- Live evals: `npm run eval:flagship` — 5 evals (incl. webhook-alert, schedule-digest).
- Channels: Slack (`agent/channels/slack.ts`), authenticated alert webhook (`agent/channels/alert.ts`).
- Production deploy: `npm run deploy:flagship` → prebuilt; Agent Runs in Vercel Observability.
- Schedule primitive: `agent/schedules/digest.ts` + `evals/schedule-digest.eval.ts`.
- Webhook eval: `evals/webhook-alert.eval.ts` asserts unauthenticated POST is rejected.

## Domain rule

Prioritize containment, customer impact, owner, and next update time.

## Tags

incident, sre
