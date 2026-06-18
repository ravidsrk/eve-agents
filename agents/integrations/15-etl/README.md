# 15 · ETL / Transform Agent

**Rationale.** Classic Extract→Transform→Load inside a sandbox: fetch live data, compute derived
values, and write an artifact. Exercises network egress + python in a SuperServe microVM.

**Stack.** OpenRouter `openai/gpt-oss-120b` · SuperServe `superserve/python-ml`.

## Run
```bash
bash ../../scripts/run-catalog-agent.sh agents/integrations/15-etl 3125 "Fetch USD rates for EUR,GBP,JPY,INR; convert 1000 USD; write /workspace/out/converted.json"
```

## Proof (see `run.log`)
Extracted live rates from Frankfurter, transformed, wrote `/workspace/out/converted.json`:
`{ "EUR": 862.74, "GBP": 745.95, "INR": 94530.0, "JPY": 160310.0 }` and printed it back.

## Cost notes
~few k tokens; one `python-ml` microVM. ≈ $0.001.
