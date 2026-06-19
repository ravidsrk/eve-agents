# PR triage reviewer

## Rationale

PR triage reviewer is a real-world eve archetype for Engineering.

Mission: Summarizes diffs, labels risk, and suggests reviewers.

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
- `agent/channels/github.ts` for GitHub App PR/issue @mentions (Vercel deploy).

## Run

```bash
bash ../../scripts/run-catalog-agent.sh agents/catalog/11-pr-triage-reviewer 3211 "Review the current pr triage reviewer queue and write a prioritized action report."
```

Requires:

- `OPENROUTER_API_KEY` for model inference.
- `SUPERSERVE_API_KEY` for sandbox-backed eve file/code execution.
- Optional valid `MONID_API_KEY` for live external research in follow-up work.

## Tools and data

- `load_dossier`: loads `agent/data/dossier.json`.
- `analyze_diff`: risk labels and reviewer suggestions from `agent/data/pr-patch.diff`.
- `search_records`: searches `agent/data/records.json`.
- `analyze_records`: scores local records for risk and opportunity.
- `write_report`: writes a markdown artifact under `.agent-artifacts/`.
- `record_decision`: approval-gated simulated side effect.
- `fetch_live_json`: guarded HTTPS JSON fetch, disabled unless `ALLOW_EXTERNAL_FETCH=1`.

## Sample prompt

> Review the current pr triage reviewer queue and write a prioritized action report.

## Expected behavior

The agent should load the dossier, inspect records, identify the highest-priority item, state
assumptions and uncertainty, and write a report. For any action that changes an external system, it
must use `record_decision`, which pauses for human approval.

## Deploy on Vercel

S-tier showcase — set `GITHUB_APP_*` env vars; webhook at `/eve/v1/github`. Pattern from [vercel-labs/eve-pr-triage-agent-template](https://github.com/vercel-labs/eve-pr-triage-agent-template).

## Evidence status

- Seeded patch: `agent/data/pr-patch.diff`.
- Evals: `evals/smoke-dossier.eval.ts`, `evals/pr-triage.eval.ts`.
- GitHub channel: `agent/channels/github.ts` (HTTP channel proves agent locally).

## Domain rule

Credit the Vercel PR triage template pattern in the README.

## Tags

github, review
