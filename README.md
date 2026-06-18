# eve-exploration — a tested catalog of agents on Vercel **eve**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Open source (MIT).** Free to use, modify, and share. Contributions welcome — see [License](LICENSE).

A deep, hands-on exploration of [Vercel **eve**](https://github.com/vercel/eve) (the open-source,
filesystem-first framework for durable AI agents, `eve@0.11.4`, public beta) wired to three real
platforms:

- **OpenRouter** — model inference (cheap models by default), via `@ai-sdk/openai-compatible`.
- **SuperServe** — Firecracker microVM sandboxes (persistent, resumable), via a **custom eve
  `SandboxBackend`**.
- **Monid** — agent-native tool router (discover / inspect / run), via authored tools **and** its
  remote MCP server.

Everything here was actually run against the live platforms; each archetype ships a captured
`run.log`. See **[RESEARCH.md](RESEARCH.md)** (how eve works + version pins), **[VERIFY.md](VERIFY.md)**
(Phase-1 happy-path logs), and **[FINDINGS.md](FINDINGS.md)** (what eve does well, sharp edges, and
the integration story).

## Architecture

```
packages/
  openrouter/          @lab/openrouter         — OpenRouter LanguageModel for defineAgent (AI SDK v7-beta)
  superserve-backend/  @lab/superserve-backend — custom eve SandboxBackend on SuperServe microVMs
  monid-tools/         @lab/monid-tools        — Monid client + eve tools + USD budget guard
eve-lab/               canonical happy-path app (get_weather) + eval suite
archetypes/01..22/     one eve project per archetype (agent/ + README + run.log)
robustness/            failure-mode tests (budget cap, provider error, sandbox crash)
```

An npm-workspaces monorepo hoists a single `node_modules`; each archetype is still its own eve
project directory. Archetype packages use unscoped names (`arch-01-data-analyst`, …) so `eve eval`
matches the running agent id.

## Scripts

| Command | What it does |
|---------|--------------|
| `bash scripts/setup.sh` | Write `.secrets/eve.env`, copy `.env.local` to every app, `npm install` |
| `bash scripts/run_archetype.sh <dir> <port> "<msg>"` | Boot one archetype, drive a session, write `run.log` |
| `npm run typecheck` | Typecheck all workspaces that define a `typecheck` script |
| `npm test` | Monid budget-cap robustness test (no API keys) |
| `npm run test:robustness` | Budget cap + live provider/sandbox tests (needs keys) |
| `npm run test:hitl` | HITL pause/approve/resume proof (archetype 08) |
| `npm run test:durable` | Full process restart + VM reconnect proof (archetype 11) |

## Prerequisites
- **Node 24+** (eve `engines`). `nvm install 24 && nvm use 24`.
- API keys for OpenRouter, SuperServe, Monid (see `.env.example`).

## Setup (reproducible from a fresh clone)
```bash
export OPENROUTER_API_KEY=...  SUPERSERVE_API_KEY=...  MONID_API_KEY=...
bash scripts/setup.sh          # writes .secrets/eve.env + per-app .env.local, then npm install
cd eve-lab && npx eve dev --no-ui --port 3000
curl -s -XPOST localhost:3000/eve/v1/session -H 'content-type: application/json' \
  -d '{"message":"weather in Brooklyn?"}'      # then stream /eve/v1/session/<id>/stream
```
`bash scripts/run_archetype.sh <dir> <port> "<message>"` (or `./run_archetype.sh` from repo root;
see any archetype README) boots an app, drives one session, and writes `run.log`.

## The 22 archetypes

| # | Archetype | What it demonstrates | Live deps |
|---|-----------|----------------------|-----------|
| [01](archetypes/01-data-analyst) | Data analyst | pandas over a seeded CSV in-sandbox | SuperServe |
| [02](archetypes/02-web-research) | Web research | Monid discover→inspect→run (paid, budget-guarded) | Monid |
| [03](archetypes/03-coding-refactor) | Coding / refactor | fix failing tests in a node sandbox | SuperServe |
| [04](archetypes/04-pdf-qa) | PDF / doc Q&A | extract a real PDF (binary seed + runtime pip) | SuperServe |
| [05](archetypes/05-sql-agent) | SQL agent | SQLite build + query in-sandbox | SuperServe |
| [06](archetypes/06-multi-tool) | Multi-tool orchestrator | parallel tool calls + synthesis (+evals) | — |
| [07](archetypes/07-subagents) | Subagent hierarchy | declared specialists + `subagent.*` events | — |
| [08](archetypes/08-hitl) | Human-in-the-loop | `needsApproval` durable pause → approve → resume | — |
| [09](archetypes/09-cron) | Scheduled / cron | `defineSchedule` + dev dispatch route | — |
| [10](archetypes/10-slack) | Slack channel | support bot; HTTP-proven, Slack via Connect | — |
| [11](archetypes/11-durable-resume) | Durable resume | survives a **full process restart** (VM reconnect) | SuperServe |
| [12](archetypes/12-mcp) | MCP consumer | Monid **remote MCP** server via Bearer | Monid MCP |
| [13](archetypes/13-openapi) | OpenAPI connection | live Frankfurter FX via `defineOpenAPIConnection` | Frankfurter |
| [14](archetypes/14-codebase) | Codebase agent | clone a repo + analyze in-sandbox | SuperServe |
| [15](archetypes/15-etl) | ETL / transform | extract→transform→load an artifact | SuperServe |
| [16](archetypes/16-eval-self) | Self-checking | verify the answer with a 2nd method before replying | SuperServe |
| [17](archetypes/17-sentiment) | Social / sentiment | Monid live items + LLM sentiment | Monid |
| [18](archetypes/18-rag) | RAG | TF-IDF retrieval over a seeded KB | SuperServe |
| [19](archetypes/19-web-ui) | Streaming web UI | NDJSON chat UI + tool indicators (screenshot) | — |
| [20](archetypes/20-swarm) | Swarm | fan out N jobs across **N SuperServe VMs** | N× SuperServe |
| [21](archetypes/21-skills) | Skills | load-on-demand procedures via `load_skill` | — |
| [22](archetypes/22-security) | Network policy | deny-all egress enforced in-sandbox | SuperServe |

## Evals & robustness
- `eve eval` suites: `eve-lab/evals` (weather) and `archetypes/06-multi-tool/evals` (orchestration) —
  all gates pass. Run `cd eve-lab && npx eve eval`.
- `robustness/` — budget cap, provider error, sandbox-crash recovery (all PASS). See
  [robustness/README.md](robustness/README.md).

## Cost discipline
Cheap models by default (`openai/gpt-oss-120b`, ~$0.039/1M in). Monid `run` calls are budget-guarded
(`MONID_MAX_CALL_USD`, `MONID_BUDGET_USD`) and logged to `.monid-costs.jsonl`. SuperServe VMs auto-pause
or are killed after use. Total Monid spend across this lab: ~$0.03.

## Secrets
Read from env / `.env.local` only; **never committed**. `.gitignore` excludes `.env*`, `.secrets/`,
and secret files. `.env.example` documents the variables.

## License

This project is [MIT licensed](LICENSE). You may use, copy, modify, merge, publish, distribute,
sublicense, and sell copies of this software without restriction, provided the license notice is
included in all copies or substantial portions.

Third-party dependencies (eve, SuperServe SDK, etc.) carry their own licenses — see `package-lock.json`.
