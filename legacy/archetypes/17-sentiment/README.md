# 17 · Social-Listening / Sentiment (via Monid)

**Rationale.** Gauge sentiment around a topic from fresh external items. Discovers a social/news
endpoint via Monid, runs it (paid, budget-guarded), then classifies overall sentiment with cited
representative items. Combines live external data + LLM classification.

**Stack.** OpenRouter `openai/gpt-oss-120b` · Monid (`blockrun.ai` exa/search) · no sandbox.

## Run
```bash
bash run_archetype.sh archetypes/17-sentiment 3127 "Current sentiment around 'Tesla'? Fetch recent items via Monid and classify."
```

## Proof (see `run.log`)
Discovered + ran `blockrun.ai/api/v1/exa/search` (paid **$0.011**, logged to `.monid-costs.jsonl`),
classified Tesla sentiment as **mixed/neutral**, citing 3 real headlines (FSD data scrutiny vs.
Cybercab/robotaxi approvals).

## Note
The budget guard's per-call cap ($0.25) is enforced per call; the running total resets per process
(each archetype run is a fresh process). Per-call protection always applies.

## Cost notes
Monid: $0.011. OpenRouter: ~a few cents.
