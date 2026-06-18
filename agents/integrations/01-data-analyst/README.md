# 01 · Data Analyst (pandas in a SuperServe sandbox)

**Rationale.** The canonical "analyst" agent: answer questions about a local dataset by
actually running pandas, not by guessing. The CSV is seeded into the sandbox at
`/workspace/data/sales.csv`; the agent uses the built-in `bash` tool to run `python3` inside a
SuperServe `python-ml` microVM. This exercises eve's default harness + the custom SuperServe
sandbox backend (including seed-file mounting) with OpenRouter inference.

**Stack.** OpenRouter `openai/gpt-oss-120b` · SuperServe `superserve/python-ml` (pandas 3.0.3).

## Run
```bash
# from repo root, with env loaded (.env.local is created from .secrets/eve.env)
cd agents/integrations/01-data-analyst
npx eve dev --no-ui --port 3101
# then:
curl -s -XPOST localhost:3101/eve/v1/session -H 'content-type: application/json' \
  -d '{"message":"Which region has the highest total revenue and what is that total? Also the grand total."}'
curl -sN localhost:3101/eve/v1/session/<sessionId>/stream
```
Or use the harness: `bash ../../scripts/run-catalog-agent.sh agents/integrations/01-data-analyst 3101 "<question>"`.

## Proof (see `run.log`)
The agent inspected the columns, then computed in-sandbox:
```
region: East 11150, North 12100, South 10900, West 7550
Max region: North 12100 ; Grand total revenue: 41700
```
Final reply: **North = $12,100 highest; grand total = $41,700** (verified correct by hand).

## Failures hit + fixes
- llama-3.1-8b was too weak (guessed `Region` vs `region`, then asked a clarifying question
  instead of retrying). Switched the lab default to `openai/gpt-oss-120b`, which inspects columns
  first and self-corrects.
- Seed files initially didn't mount: eve runs `prewarm` (build) and `create` (runtime worker) in
  separate processes, so the backend now persists seed files to disk and replays them on create.

## Cost notes
~6–8k input + ~600 output tokens over 2 sandbox calls (≈ $0.001 on gpt-oss-120b). One short-lived
`python-ml` microVM, paused on idle.
