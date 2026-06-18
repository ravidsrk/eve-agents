# Runbook: Restart checkout-service

**Trigger:** Elevated 5xx on `/v1/checkout` for >5 minutes.

## Steps

1. Confirm blast radius — check error rate in logs (grep `checkout-service` + `ERROR`).
2. Verify dependency — `payments-service` circuit breaker state.
3. **HITL** — Notify #incidents channel with summary before restart.
4. Drain traffic — scale checkout-service replicas to 0 (or enable maintenance mode).
5. Restart `payments-service` if circuit breaker is OPEN >60s.
6. Scale checkout back up; watch health for 10 minutes.
7. Document timeline in incident ticket.

**Rollback:** Re-enable previous deployment tag if errors persist after restart.