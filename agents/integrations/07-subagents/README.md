# 07 · Subagent / Handoff Hierarchy

**Rationale.** A coordinator that owns no domain skills and delegates to **declared subagents**
(`agent/subagents/mathematician`, `agent/subagents/poet`), each its own `defineAgent` with a
required `description`. Demonstrates eve's subagent isolation + the `subagent.called` /
`subagent.completed` control-plane events.

**Stack.** OpenRouter `openai/gpt-oss-120b` · no sandbox.

## Run
```bash
bash ../../scripts/run-catalog-agent.sh agents/integrations/07-subagents 3115 "Compute the 10th Fibonacci number, then write a two-line poem about it."
```

## Proof (see `run.log`)
Stream shows `subagent.called` → `subagent.completed` for both children. `mathematician` returned
**55** (F₁₀ with F₀=0); `poet` returned a two-line poem about 55; the coordinator combined them.
`eve info` confirms both subagents discovered (`Compile ready, 0 errors`).

## Cost notes
3 model sessions (parent + 2 children), all gpt-oss-120b. ≈ $0.002.
