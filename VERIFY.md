# VERIFY — Phase 1 happy path (real logs)

Everything below was captured live on 2026-06-18 against the real platforms. Secrets are
read from `.env.local` / env and never printed.

## 0. Toolchain
- Node `v24.17.0` (via nvm; eve requires `>=24`).
- `eve@0.11.4`, `ai@7.0.0-beta.178`, `@ai-sdk/provider@4.0.0-beta.19`, `zod@4.4.3`.

## 1. OpenRouter as the model provider (clean swap + documented friction)

`eve` accepts a provider-authored AI-SDK `LanguageModel`. eve pins `ai@7-beta` (provider spec
**v4**); the OpenRouter-branded provider targets the older v6 spec, so we use the version-matched
`@ai-sdk/openai-compatible` pointed at OpenRouter. Verification script (`eve-lab/scripts/verify-openrouter.mjs`)
calling `generateText` through **eve's bundled `ai`**:

```
model.specificationVersion = v4
model.provider = openrouter.chat | modelId = meta-llama/llama-3.1-8b-instruct
=== TEXT ===
Ping
=== USAGE === {"inputTokens":17,"outputTokens":1,"totalTokens":18}
=== finishReason === stop
```

Friction #1 (documented): when `model` is a custom `LanguageModel`, eve cannot read the model's
context window from the AI Gateway, so **compaction fails to compile**:

```
Cannot compile agent compaction because the primary compaction trigger model
"openrouter/meta-llama/llama-3.1-8b-instruct" does not have known AI Gateway context window metadata.
```

Fix: set the agent-level escape hatch `modelContextWindowTokens: 131072` in `agent.ts`. After that,
`eve info` → `Compile ready · Diagnostics 0 errors, 0 warnings`.

## 2. SuperServe as the eve sandbox backend (custom `SandboxBackend`)

On this host there is **no Docker and no KVM**, so eve's `docker()`/`microsandbox()` backends can't
run and `vercel()` needs a deploy. The custom `@lab/superserve-backend` is the only path to
real-binary execution locally. Live proof (`packages/superserve-backend/test-live.mjs`,
template `superserve/python-ml`):

```
[superserve-test] creating sandbox from template superserve/python-ml ...
[superserve-test] created d8e66b37-... in 635 ms
[superserve-test] wrote /workspace/data.txt
[superserve-test] run exitCode= 0
[superserve-test] run stdout= "HELLO FROM EVE\nLINE2\nLINE3\n\npython ok\n"
[superserve-test] readTextFile lines 2-3 = "line2\nline3\n"
[superserve-test] spawn exitCode= 0 stdout= "tick-1\ntick-2\ntick-3"
[superserve-test] pausing sandbox...
[superserve-test] reconnecting to d8e66b37-... ...
[superserve-test] after resume, marker.txt = "persisted-value-42\n"
[superserve-test] after removePath, marker.txt = null (deleted ✓)
[superserve-test] ALL CHECKS PASSED ✓
```

This proves: file write/read, `readTextFile` line ranges, blocking `run` of a real binary (python3),
streaming `spawn`, `removePath`, and **durable resume** (pause → `Sandbox.connect` → `/workspace`
filesystem intact). System templates discovered: `python-3.11`, `python-ml` (pandas 3.0.3),
`node-22` (node v22.22.3), `code-interpreter`, `claude-code`, `base`. Boot times ~0.6–1.4s.

## 3. Monid live tool router (free discover + budget guard)

```
$ monid.discover("recent tweets about AI", 3)
count: 3
- blockrun.ai/api/v1/surf/news/feed          | $0.00825 PER_CALL
- blockrun.ai/api/v1/surf/search/social/posts| $0.00825 PER_CALL
- blockrun.ai/api/v1/exa/search              | $0.011  PER_CALL
wallet: {"balance":{"value":495.33955,"currency":"USD"}}
```

`@lab/monid-tools` enforces a per-task cap (`MONID_MAX_CALL_USD`, default $0.25) and total budget
(`MONID_BUDGET_USD`, default $5), logging every paid `run` to a JSONL cost ledger.

## 4. Canonical `get_weather` over the HTTP API (NDJSON stream)

Dev server: `eve dev --no-ui --port 3000` → `[DEV] server listening at http://127.0.0.1:3000/`,
`GET /eve/v1/health` → `{"ok":true,"status":"ready",...}`.

Create session:
```
POST /eve/v1/session  {"message":"What is the weather in Brooklyn? Use the get_weather tool."}
header  x-eve-session-id: wrun_01KVD4969BDZWRJ8PN7VNHXKT7
body    {"continuationToken":"eve:0b3d...","ok":true,"sessionId":"wrun_01KVD4969BDZWRJ8PN7VNHXKT7"}
```

Stream (`GET /eve/v1/session/:id/stream`, NDJSON) — event types observed:
```
session.started, turn.started, message.received, step.started, actions.requested,
action.result, step.completed, message.appended, message.completed, turn.completed, session.waiting
```
Key events:
```
session.started   modelId = openrouter/meta-llama/llama-3.1-8b-instruct
actions.requested get_weather { city: "Brooklyn" }
action.result     { city:"Brooklyn", condition:"Sunny", temperatureF:72, humidity:0.41 }
message.completed "The current weather in Brooklyn is Sunny with a temperature of 72°F and humidity of 41%."
step.completed    usage { inputTokens: 4136, outputTokens: 45 }
turn.completed ; session.waiting { wait: "next-user-message" }
```

Follow-up (durable session, `continuationToken`):
```
POST /eve/v1/session/wrun_...  {"continuationToken":"eve:0b3d...","message":"Now do Queens."}
-> action.result { city:"Queens", condition:"Sunny", temperatureF:72, humidity:0.41 }
-> "The current weather in Queens is Sunny with a temperature of 72°F and humidity of 41%."
```

## Cost notes (Phase 1)
- OpenRouter: ~4k input + ~60 output tokens per turn on llama-3.1-8b (~$0.0001/turn). Negligible.
- SuperServe: a few short-lived microVMs, paused/killed after use.
- Monid: $0.00 (only free `discover`/`wallet` called).
