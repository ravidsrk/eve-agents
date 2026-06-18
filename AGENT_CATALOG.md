# Agent catalog — research-driven rebuild (Phase 0b+)

> **Goal:** A catalog of **real-world, working eve agents** — not framework checkbox demos.
> Research first (official templates + Monid discover), then port/build, then live-test.

## Sources (in priority order)

| Source | URL | Role |
|--------|-----|------|
| **eve e2e fixtures** | [vercel/eve/e2e/fixtures](https://github.com/vercel/eve/tree/main/e2e/fixtures) | Authoritative reference agents with evals — **port first** |
| **eve app fixtures** | [apps/fixtures/weather-agent](https://github.com/vercel/eve/tree/main/apps/fixtures) | Dev/CI fixtures |
| **eve templates** | [apps/templates/web-chat-next](https://github.com/vercel/eve/tree/main/apps/templates) | Deployable starter |
| **Monid discover** | `npm run research:monid` | Live external APIs + patterns for production agents |
| **This lab** | `packages/*` | OpenRouter, SuperServe sandbox, Monid tools |

---

## Tier 1 — Official eve fixtures (ported → `agents/official/`)

All ported via `bash scripts/port-eve-fixture.sh <name>`. Model: OpenRouter (`@lab/openrouter`). Credits: [vercel/eve](https://github.com/vercel/eve).

| Agent | Upstream fixture | Real-world pattern | Sandbox | Status |
|-------|------------------|-------------------|---------|--------|
| **agent-openapi-swagger** | `e2e/fixtures/agent-openapi-swagger` | **Transit/API agent** — TfL OpenAPI + HITL on connections | — | Ported, evals pending |
| **agent-subagents-hitl** | `e2e/fixtures/agent-subagents-hitl` | **Finance delegate** — stock-price subagent + approval | — | Ported |
| **agent-schedules** | `e2e/fixtures/agent-schedules` | **Scheduled worker** — cron + multi-step tools | — | Ported |
| **agent-skills** | `e2e/fixtures/agent-skills` | **Policy agent** — dynamic skills, tenant procedures | — | Ported |
| **agent-tools** | `e2e/fixtures/agent-tools` | **Tool harness** — multi-step tool loops, failures | — | Ported |
| **agent-tools-hitl** | `e2e/fixtures/agent-tools-hitl` | **Approval gates** on side-effecting tools | — | Ported |
| **agent-tools-sandbox** | `e2e/fixtures/agent-tools-sandbox` | **Code execution** — bootstrap, python, network policy | SuperServe `python-ml` | Ported + SuperServe |
| **agent-subagents** | `e2e/fixtures/agent-subagents` | **Specialist routing** — declared subagents | — | Ported |
| **agent-basic-runtime** | `e2e/fixtures/agent-basic-runtime` | **Runtime** — multi-turn, images, output schema | — | Ported |
| **agent-channels** | `e2e/fixtures/agent-channels` | **Multi-channel** — webhook + cross-channel | — | Ported |

**Run evals (after `bash scripts/setup.sh` + valid keys):**
```bash
cd agents/official/agent-openapi-swagger && npx eve eval --strict
```

---

## Tier 2 — Production agents to build (from Monid + industry patterns)

Run `npm run research:monid` to populate `research/discover-results.jsonl`, then implement top picks in `agents/production/`.

| # | Agent | Why it's real-world | eve primitives | Monid / external |
|---|-------|---------------------|----------------|------------------|
| P01 | **Incident triage** | On-call reads logs, checks status, drafts postmortem | tools + Monid | `log-parse`, `error-explain` — **built** `agents/production/p01-incident-triage` |
| P02 | **PR review** | Clone repo, run tests, comment on diff | tools + Monid | `code-review`, `github-repo-analyze`, `pr-description-generate` — **built** `agents/production/p02-pr-review` |
| P03 | **Competitive intel digest** | Scheduled scan of competitor news → summary | tools + Monid | `exa/search`, `exa/answer` — **built** `agents/production/p03-competitive-intel` |
| P04 | **Invoice extractor** | PDF → structured JSON for accounting | tools + Monid | `invoice-extract`, `pdf-extract` — **built** |
| P05 | **Support ticket router** | Classify, draft reply, escalate with HITL | tools + Monid | `exa/search`, `exa/answer` — **built** |
| P06 | **SQL analyst** | NL → SQL on seeded warehouse schema | tools + Monid | `sql-generate`, `sql-explain`, `sql-optimize` — **built** |
| P07 | **Runbook executor** | Follow ops runbook steps with approvals | tools + HITL instructions | runbook workspace + `log-parse` — **built** |
| P08 | **Lead enricher** | Company/person → CRM fields | tools + Monid | PDL `company/person enrich` — **built** |
| P09 | **Contract clause checker** | Load policy skill, flag risky clauses | tools + policy skill | `contract-extract` — **built** |
| P10 | **Data pipeline debugger** | ETL failed → inspect artifacts, fix script | tools + Monid | `log-parse`, `error-explain` — **built** |

All Tier 2 agents (P01–P10) live under `agents/production/`.

---

## Tier 3 — Legacy primitive demos (`legacy/archetypes/`)

The original v1 build (22 archetypes) mapped **eve features**, not products. Kept for integration reference only — **do not extend**.

Examples of what was wrong:
- `get_weather` stub repeated everywhere (not real weather API)
- `21-skills` refund policy duplicated eve docs
- `18-rag` on 4 hand-written txt files (not a RAG product)
- No credits to vercel/eve official fixtures

See [legacy/README.md](legacy/README.md).

---

## Monid research queries (Phase 0b)

Executed by `scripts/research-monid.mjs` (20 queries, results → `research/discover-results.jsonl`):

- Frameworks: github agent template, langchain, crewai, vercel eve
- Ops: incident response, SRE logs, on-call runbook
- Engineering: PR review, CI debug, codebase analysis
- Data: competitive intel, sentiment, web research, SQL analytics
- Verticals: legal contracts, sales leads, e-commerce, healthcare

**Budget:** `MONID_BUDGET_USD=500`, `MONID_MAX_CALL_USD=5` (research phase).

---

## Directory layout

```
agents/
  official/          # Ported vercel/eve fixtures (Tier 1)
  production/        # Research-driven real-world agents (Tier 2) — P01–P10
legacy/
  archetypes/        # v1 feature demos (Tier 3)
packages/            # OpenRouter, SuperServe, Monid integrations
research/            # Monid discover logs (gitignored)
```

---

## Next steps

1. **You:** Put real API keys in `.secrets/eve.env` (rotate any keys pasted in chat), then `bash scripts/setup.sh`
2. **Run:** `npm run research:monid` → review `research/discover-results.jsonl`
3. **Validate:** `npx eve eval --strict` on each `agents/official/*` fixture
4. **Validate:** `npx eve eval --strict` + live dev when OpenRouter/SuperServe keys are set