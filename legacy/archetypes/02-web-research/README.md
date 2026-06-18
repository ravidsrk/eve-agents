# 02 · Web-Research (live data via Monid)

**Rationale.** Answer questions from fresh external data instead of training memory. The agent
uses Monid's tool router: `monid_discover` (free) to find endpoints, `monid_inspect` (free) to read
schemas/pricing, and `monid_run` (paid, budget-guarded) to fetch live results, then answers with
citations. Demonstrates eve authored tools wrapping a paid external router with a USD budget cap.

**Stack.** OpenRouter `openai/gpt-oss-120b` · Monid (`blockrun.ai` exa/search) · no sandbox (just-bash default).

## Run
```bash
cd archetypes/02-web-research && npx eve dev --no-ui --port 3110
# POST a research question to /eve/v1/session and stream it
bash run_archetype.sh archetypes/02-web-research 3110 "Find recent news about OpenAI and summarize 3 headlines. Use Monid."
```

## Proof (see `run.log`)
Tool sequence: `monid_discover` → `monid_inspect` ×3 → `monid_run` on `blockrun.ai/api/v1/exa/search`
(live web search). Returned 3 real, cited June-2026 OpenAI headlines (G7 speech, AI-sovereignty,
leaked financials). Paid call logged to `.monid-costs.jsonl`: **$0.011** (`totalSpentUsd: 0.011`).

## Failures hit + fixes
- None functionally; the budget guard (`MONID_MAX_CALL_USD=0.25`, `MONID_BUDGET_USD=5`) allowed the
  $0.011 call. A run over the cap is refused and the agent falls back to summarizing discovery.

## Cost notes
Monid: $0.011 (one PER_CALL exa/search). OpenRouter: ~a few cents of gpt-oss-120b tokens.
