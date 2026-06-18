# 11 · Long-Running Durable Task (survives a full restart)

**Rationale.** The headline durability proof. eve sessions are durable workflows; this agent stores
state in a SuperServe sandbox and recalls it **after the dev server process is killed and a brand
new one is started**. It proves two things at once: (1) eve persists durable session state across a
full process restart, and (2) the custom SuperServe backend reconnects to the *same* microVM (via
the reconnect metadata captured in `captureState`), so `/workspace` is intact.

**Stack.** OpenRouter `openai/gpt-oss-120b` · SuperServe `superserve/base` (paused on dispose, not killed).

## Run
```bash
bash scripts/durable_test.sh     # or: npm run test:durable
```
Flow: server #1 saves `PURPLE-42-<rand>` to `/workspace/state.txt` → server #1 **killed** →
server #2 (new PID) recalls the value via the same `continuationToken`.

## Proof (see `run.log`)
```
=== PROCESS #1: save ===   SID=wrun_...  PID1=60905
save reply: ... PURPLE-42-21937 ...
server #1 sandbox: sandbox=9c3066de-a42b-4c81-9bcb-fb822851c861
=== KILL server #1 entirely ===   PID1 dead (full restart)
=== PROCESS #2: recall ===   PID2=60984 (different from PID1)
tool-result: { stdout: "PURPLE-42-21937" }
recall reply: ... PURPLE-42-21937
RESULT: PASS ✓ (recalled after full restart)
```

## How it works
- The backend `dispose()` **pauses** the VM (preserves `/workspace`) instead of killing it.
- `captureState()` returns `{ superserveSandboxId }`; eve persists it in durable session state.
- On the next turn (even in a new process) `create()` sees `existingMetadata.superserveSandboxId`
  and calls `Sandbox.connect(...)`, resuming the same VM.

## Cost notes
One long-lived `base` microVM (paused between turns). ≈ $0.001 of tokens.
