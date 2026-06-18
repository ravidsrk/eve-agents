# Monid in eve-exploration

Monid is the **research layer** for discovering live APIs and data sources before building production agents.

**Canonical skill (agents + humans):** [https://monid.ai/SKILL.md](https://monid.ai/SKILL.md)

## Setup

```bash
# 1) Put MONID_API_KEY=monid_live_... in .secrets/eve.env
bash scripts/setup.sh
bash scripts/setup-monid.sh

# 2) Verify
monid balance
monid discover -q "github open source agent"
```

## Project integration

| Layer | Path | Role |
|-------|------|------|
| **CLI** | `monid` (`@monid-ai/cli`) | discover / inspect / run — follow SKILL.md workflow |
| **Research script** | `npm run research:monid` | 20-query sweep → `research/discover-results.jsonl` |
| **eve tools** | `@lab/monid-tools` | `monid_discover`, `monid_inspect`, `monid_run` inside agents |
| **MCP** | `defineMcpClientConnection` | `https://mcp.monid.ai/v1` (bypasses budget guard — use discover/inspect only) |

## Workflow (from SKILL.md)

1. **Discover first** — `monid discover -q "<short noun phrase>"`
2. **Inspect** — `monid inspect -p <provider> -e <endpoint>`
3. **Run** — map schema to `-i` / `--query` / `--path`; save with `-o file.json`
4. **Poll** — `monid runs get -r <id>` (or `-w` for scripts)

## Budget (research phase)

In `.secrets/eve.env`:

```
MONID_BUDGET_USD=500
MONID_MAX_CALL_USD=5
```

`@lab/monid-tools` enforces these caps for agent `monid_run` calls. The CLI does not — use judgment on paid runs.

## Rules for this repo

- Run discover **before** building a new production agent that needs external data.
- Log research outputs to `research/` (gitignored JSONL).
- Credit Monid endpoints in agent READMEs when agents depend on them.