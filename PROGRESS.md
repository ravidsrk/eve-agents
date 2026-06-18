# Progress

Running log. Newest entries on top.

## PR #2 merge review — 2026-06-18

- Resolved PR #2 against the current `origin/main`.
- Preserved `main`'s `agents/official/`, `agents/production/`, and `legacy/archetypes/` layout.
- Preserved the PR branch's 50 real-world `archetypes/*` catalog and live `run.log` evidence.
- Combined root workspace coverage so `npm run typecheck --workspaces` includes packages, `eve-lab`,
  the 50 archetypes, official fixtures, production agents, and legacy demos.

## 50-agent catalog — 2026-06-18

- Created branch `rebuild-50-real-world-agents`.
- Set local git identity to `Ravindra Kumar <ravidsrk@gmail.com>`.
- Researched current eve docs, Vercel examples, and Vercel Labs templates.
- Added [AGENT_MATRIX.md](AGENT_MATRIX.md) with 50 real-world agent targets.
- Added `@lab/agent-kit` shared tools:
  - `load_dossier`
  - `search_records`
  - `analyze_records`
  - `write_report`
  - `record_decision`
  - `fetch_live_json`
- Added `scripts/generate-real-world-archetypes.mjs`.
- Replaced the old 22-agent toy catalog with 50 real-world archetypes.
- Added `scripts/verify-real-world-archetypes.mjs`.
- Regenerated `package-lock.json` from the current workspace set.
- Passed local validation:
  - `npm run verify:catalog`
  - `npm test`
  - `npm audit --omit=dev`
  - `npm run typecheck`
- Validated supplied OpenRouter, SuperServe, and Monid keys.
- Ran live eve sessions for all 50 archetypes.
- Committed captured `run.log` files for all 50 archetypes.
- Added [VERIFY-LIVE.md](VERIFY-LIVE.md).
- Added [MONID_RESEARCH.md](MONID_RESEARCH.md).

## v2 production catalog — 2026-06-18

- Indexed all 10 official [vercel/eve e2e fixtures](https://github.com/vercel/eve/tree/main/e2e/fixtures).
- Added [AGENT_CATALOG.md](AGENT_CATALOG.md) with Tier 1/2/3 plan and Monid query list.
- Added `scripts/port-eve-fixture.sh` for upstream fixture ports.
- Added `scripts/research-monid.mjs` and `research/discover-results.jsonl`.
- Added Monid CLI setup with `scripts/setup-monid.sh`, [MONID.md](MONID.md), and `npm run setup:monid`.
- Ported 10/10 fixtures into `agents/official/`.
- Wired `agent-tools-sandbox` to SuperServe `python-ml`.
- Added production agents P01-P10 in `agents/production/`.
- Added Monid-backed domain tools and READMEs for P01-P10.
- Added `npm run smoke:production` for live Monid smoke coverage.
- Moved v1 primitive demos from `archetypes/` to `legacy/archetypes/`.

## Next recommended pass

1. Add domain-specific Monid-backed tools for the strongest 10 agents from the 50-agent catalog.
2. Add eve eval suites for those 10.
3. Add Slack/GitHub/Linear channels where they match the workflow.
4. Add richer fixtures and failure-mode tests for side-effect agents.
5. Run `npx eve eval --strict` against official and production agents with live keys.
