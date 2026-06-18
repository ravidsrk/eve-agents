# Catalog

**50 real-world eve agents** — job templates with instructions, seeded dossiers, shared tools, and
live OpenRouter + SuperServe evidence.

Each agent follows the same structure so you can diff, fork, and deepen individual jobs without
relearning the layout.

## Run any agent

```bash
bash scripts/run-catalog-agent.sh agents/catalog/06-incident-commander 3206 \
  "Load the dossier, analyze records, and write a prioritized action report."
```

Ports follow `32XX` where `XX` is the agent number (`06` → `3206`).

## Shared tools (`@lab/agent-kit`)

- `load_dossier` — local context and integration notes
- `search_records` / `analyze_records` — evidence lookup and scoring
- `write_report` — durable markdown artifact
- `record_decision` — approval-gated side effects
- `fetch_live_json` — opt-in HTTPS JSON when `ALLOW_EXTERNAL_FETCH=1`

## Matrix

Full job descriptions: [AGENT_MATRIX.md](../../AGENT_MATRIX.md) · [AGENT_CATALOG.md](../../AGENT_CATALOG.md)

## Go deeper

For Monid-backed custom tools on related jobs, see [`../production/`](../production/) (P01–P10 pairs).