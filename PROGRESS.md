# PROGRESS

Running log. Newest entries on top.

## Legend
- ✅ done  · 🟡 in progress  · ⬜ not started

## v2 rebuild (research-driven catalog) — 2026-06-18

- 🟡 **Phase 0b** — Agent catalog research
  - ✅ Indexed all 10 official [vercel/eve e2e/fixtures](https://github.com/vercel/eve/tree/main/e2e/fixtures)
  - ✅ `AGENT_CATALOG.md` — Tier 1/2/3 plan + Monid query list
  - ✅ `scripts/port-eve-fixture.sh` — automated upstream port
  - ✅ `scripts/research-monid.mjs` — discover sweeps → `research/discover-results.jsonl`
  - ⬜ Run Monid research (needs valid `MONID_API_KEY` in `.secrets/eve.env`)
- 🟡 **Phase 1** — Port official fixtures
  - ✅ 10/10 fixtures in `agents/official/`
  - ✅ `agent-tools-sandbox` wired to SuperServe `python-ml`
  - ⬜ `npx eve eval --strict` on each ported agent (needs API keys)
- ⬜ **Phase 2** — Production agents P01–P10 in `agents/production/`
- ✅ **Legacy** — `archetypes/` → `legacy/archetypes/`

## v1 (superseded)

- ✅ Integration lab: OpenRouter, SuperServe backend, Monid tools
- ✅ 22 primitive archetypes + FINDINGS.md — useful for integration notes, not product catalog

## Decisions (v2)

1. **Research before build** — official eve fixtures first, Monid discover for production ideas.
2. **Monid budget** — $500 total / $5 per call during research (`MONID_BUDGET_USD` / `MONID_MAX_CALL_USD`).
3. **Credits** — every `agents/official/*` README links upstream vercel/eve path.
4. **Layout** — `agents/official`, `agents/production`, `legacy/archetypes`.