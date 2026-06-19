# Reference eval parity (vercel/eve fixtures)

## Run

```bash
npm run cleanup:superserve   # if SuperServe quota exhausted
npm run validate:reference
```

## Expected on OpenRouter lab track

| Fixture | Status |
| --- | --- |
| agent-basic-runtime | PASS |
| agent-channels | PASS |
| agent-openapi-swagger | PASS |
| agent-schedules | PASS |
| agent-skills | PASS |
| agent-subagents | PASS |
| agent-subagents-hitl | PASS (subagents on OpenRouter + `modelContextWindowTokens`) |
| agent-tools-hitl | PASS (stronger model + retry prompts) |
| agent-tools-sandbox | PASS (serial evals + `onSession` bootstrap on SuperServe) |
| agent-tools | May flake — `dynamic-tools/nested` socket hang-up under long dev-server runs; use `--max-concurrency 1` |

**Last full run (2026-06-19 ship):** 9/10 fixtures pass; `agent-tools` 13/14 (nested flakes on concurrent dev load).

## CI

`validate-reference` runs on **push to main** when `OPENROUTER_API_KEY` is configured. Pre-run `cleanup:superserve` when `SUPERSERVE_API_KEY` is set.

## Upstream sync

```bash
bash scripts/port-eve-fixture.sh <fixture-name>
```