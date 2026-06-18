# Integrations

Five **eve primitive proofs** that are not covered by a single reference fixture or catalog job.
Everything else was removed — use [`reference/`](../reference/) or [`catalog/`](../catalog/) instead.

| Agent | Eve primitive | Run |
| --- | --- | --- |
| [08-hitl](08-hitl/) | HITL approval pause/resume | `npm run test:hitl` |
| [10-slack](10-slack/) | Slack channel + Vercel Connect | see agent README |
| [11-durable-resume](11-durable-resume/) | Durable session + sandbox reconnect | `npm run test:durable` |
| [16-eval-self](16-eval-self/) | Self-verifying dual-method answers | see agent README |
| [20-swarm](20-swarm/) | Parallel SuperServe sandboxes | see agent README |