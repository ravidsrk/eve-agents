# Robustness & failure-mode tests

Real, reproducible tests for the failure modes that matter when running eve with OpenRouter +
SuperServe + Monid. Each prints a `RESULT: PASS` line.

| Test | File | What it proves | Keys required |
|------|------|----------------|---------------|
| Monid budget cap | `budget-cap.mjs` | Over-cap / over-budget paid runs are refused before any network call. | None |
| Provider error | `provider-error.sh` | A bad model id yields a clean `turn.failed` (`MODEL_CALL_FAILED`); server stays healthy. | OpenRouter |
| Sandbox crash recovery | `sandbox-crash.sh` | If the VM is destroyed mid-session, the backend provisions a fresh VM; the turn still completes. | SuperServe |
| Durable resume | `scripts/durable_test.sh` | Session + sandbox filesystem survive a **full process restart**. | OpenRouter + SuperServe |
| Tool timeout (egress) | `../archetypes/22-security` | A timed-out sandbox command (`curl -m 8`, exit 28) is returned as a tool result the agent handles, not a crash. | SuperServe |
| HITL | `scripts/hitl_test.sh` | `needsApproval` parks durably; approve resumes and executes the tool. | OpenRouter |

## Run

```bash
# No API keys — runs in CI
npm test

# All robustness tests (live keys via scripts/setup.sh)
npm run test:robustness

# Individual proofs
bash scripts/hitl_test.sh
bash scripts/durable_test.sh
bash robustness/provider-error.sh
bash robustness/sandbox-crash.sh
```

## Captured evidence

**Budget cap**
```
✓ per-call cap refuses $1.00 > $0.25
RESULT: PASS (4 passed, 0 failed)
```

**Provider error**
```
types: ... step.failed, turn.failed, session.failed
turn.failed: {"code":"MODEL_CALL_FAILED","details":{"message":"AI_APICallError: bogus/... is not a valid model ID"}}
health after failure: {"ok":true,"status":"ready",...}
RESULT: PASS (turn.failed emitted, server still healthy)
```

**Sandbox crash recovery**
```
session sandbox = 660ac76a-...        # wrote CRASH-TEST here
killed 660ac76a-...                   # VM destroyed out from under the agent
new sandbox = 6d4b33f2-...            # backend provisioned a fresh VM
turn2 completed cleanly: true
reply: The file was missing, so I wrote RECOVERED to /workspace/state.txt.
RESULT: PASS (recovered on a NEW VM, old one was destroyed)
```