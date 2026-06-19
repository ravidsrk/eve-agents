# Reference eval parity (vercel/eve fixtures)

## Run

```bash
npm run validate:reference
```

## Expected on OpenRouter lab track

| Fixture | Typical |
| --- | --- |
| agent-basic-runtime | Pass (output-schema may flake — retried prompt) |
| agent-channels | Pass |
| agent-openapi-swagger | Pass |
| agent-schedules | Pass |
| agent-skills | Pass |
| agent-tools | Pass |
| agent-subagents | May flake (delegation) |
| agent-subagents-hitl | May flake (HITL timing) |
| agent-tools-hitl | May flake (approval) |
| agent-tools-sandbox | May flake (SuperServe boot) |

**Last full run:** 6/10 fixtures passed; HITL and sandbox fixtures are sensitive to model + SuperServe latency.

## CI

`validate-reference` runs on **push to main** when `OPENROUTER_API_KEY` is configured in GitHub secrets. Use `workflow_dispatch` for manual runs.

## Upstream sync

```bash
bash scripts/port-eve-fixture.sh <fixture-name>
```