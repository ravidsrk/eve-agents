# 08 · Human-in-the-Loop Approval

**Rationale.** A side-effecting tool (`refund_charge`) gated by `needsApproval: always()`. The turn
**durably parks** at the approval and resumes only after a human decision — eve's HITL pause/resume
protocol. Driven over HTTP with structured `inputResponses`.

**Stack.** OpenRouter `openai/gpt-oss-120b` · no sandbox.

## Run (pause → approve → resume)
```bash
bash /home/ubuntu/hitl_test.sh   # or replicate the 3 curl calls below
```
1. `POST /eve/v1/session {"message":"Please refund charge ch_123 for $40."}`
2. Stream → `input.requested` (requestId, options approve/deny) → `session.waiting`.
3. `POST /eve/v1/session/:id {"continuationToken":"...","inputResponses":[{"requestId":"...","optionId":"approve"}]}`
4. Stream → `action.result` (refund executed) → `message.completed`.

## Proof (see `run.log`)
Phase A parked: `input.requested` → `session.waiting`. After approval, phase B:
`action.result {chargeId:"ch_123", amount:40, status:"refunded", refundId:"re_ch_123_..."}` and the
agent confirmed the refund. A `deny` would skip execution.

## Cost notes
2 short turns, no sandbox. ≈ $0.0005.
