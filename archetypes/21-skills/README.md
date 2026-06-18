# 21 · Skills-Driven Agent (load-on-demand procedures)

**Rationale.** eve **skills** are markdown procedures the model pulls into context only when relevant
(progressive disclosure) via the framework's `load_skill` tool. Here a `refund_policy` skill encodes
rules the base prompt doesn't contain; the model loads it when a refund question arrives.

**Stack.** OpenRouter `openai/gpt-oss-120b` · no sandbox.

## Run
```bash
bash run_archetype.sh archetypes/21-skills 3132 "I opened an electronics item 10 days ago and want a refund. Eligible? Any fee?"
```

## Proof (see `run.log`)
Stream shows `load_skill {"skill":"refund_policy"}` → the policy markdown is injected → the agent
answers per **Rule 3**: *eligible, 15% restocking fee* (a rule that exists only in the skill, not the
instructions — proving the skill was actually loaded and used).

## Cost notes
~few k tokens, no sandbox. ≈ $0.0004.
