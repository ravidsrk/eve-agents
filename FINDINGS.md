# Findings

## What changed

The previous repository looked broad but was mostly a feature tour. This rebuild changes the unit of
value from "an eve capability" to "a real job a team could assign to an agent."

The catalog now has 50 agent archetypes, each with:

- a specific operational user,
- a mission,
- domain instructions,
- an editable playbook skill,
- local records and dossier data,
- deterministic shared tools,
- approval-gated simulated side effects,
- SuperServe sandbox configuration,
- dry-run evidence,
- a README with run instructions and live-key requirements.

## What is strong

- The repository now matches eve's filesystem model cleanly. Every archetype follows the same
  inspectable `agent/` shape.
- The matrix is grounded in Vercel's own public examples and templates: data analyst, SDR/sales,
  support, content, personal/memory, PR triage, and routing.
- Side effects are not silently simulated. `record_decision` requires human approval through eve's
  approval mechanism.
- The catalog is mechanically verifiable. `npm run verify:catalog` checks every archetype has the
  required files, records, package name, and dry-run evidence.
- TypeScript validation passes across all 50 workspaces.
- The lockfile has been regenerated from the current workspace set, with stale deleted archetypes
  removed.
- All 50 archetypes have live OpenRouter/SuperServe `run.log` evidence.
- Monid discovery and inspect now work with the supplied key, and the useful endpoint classes are
  recorded in [MONID_RESEARCH.md](MONID_RESEARCH.md).

## What is still incomplete

- The 50 agents currently share a common deterministic tool kit. That is good for consistency, but
  the next quality jump is adding deeper domain-specific tools for the highest-value agents.
- Channel-specific files are not generated yet. The best candidates for Slack/GitHub/Linear channels
  are support triage, content pipeline, PR triage, employee helpdesk, and fleet router.

## Integration story

OpenRouter:

- Clean enough through `@ai-sdk/openai-compatible`.
- Keep the AI SDK v7 beta pin aligned with eve.
- Live verification passed with `openai/gpt-oss-120b`.

SuperServe:

- Architecturally the right fit for real agent compute: persistent, isolated, stateful sandboxes.
- The custom eve backend remains the key integration point.
- Live verification passed against `superserve/python-ml`.

Monid:

- Still the right tool-router concept for research-heavy agents.
- Discovery and inspect calls passed.
- The first agents to wire to Monid-specific tools should be sales lead researcher, social sentiment,
  competitor intelligence, market/news briefing, procurement, travel operations, and literature
  mapping.

## Recommendation

Use this repo as a structured starter catalog, not as finished production automation. The next work
should be vertical depth:

1. Pick 10 high-value archetypes.
2. Add domain-specific tools and richer fixtures.
3. Add evals for those 10.
4. Add channels and real connectors where useful.

The most promising first 10 are:

- Revenue analyst
- Support ticket triage
- Incident commander
- Cloud cost optimizer
- PR triage reviewer
- Content pipeline agent
- Compliance policy checker
- RAG support search
- ETL data quality monitor
- Agent fleet router
