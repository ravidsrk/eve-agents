# Progress

## Done

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

## Blocked live work

- OpenRouter live sessions: blocked by missing `OPENROUTER_API_KEY`.
- SuperServe live sandbox sessions: blocked by missing `SUPERSERVE_API_KEY`.
- Monid live research: blocked by invalid `MONID_API_KEY`.

## Next recommended pass

1. Provide valid keys.
2. Run live sessions for at least 10 representative agents.
3. Add domain-specific tools for the strongest 10 agents.
4. Add eve eval suites for those 10.
5. Add Slack/GitHub/Linear channels where they match the workflow.
