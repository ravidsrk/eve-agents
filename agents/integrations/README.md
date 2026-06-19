# Integration agents

Five **eve primitive proofs** that are not covered by a single reference fixture or catalog job. For framework examples use [reference/](../reference/); for job templates use [catalog/](../catalog/).

| Agent | Primitive | Verify |
| --- | --- | --- |
| [08-hitl](08-hitl/) | Human-in-the-loop approval pause/resume | `npm run test:hitl` |
| [10-slack](10-slack/) | Slack channel + Vercel Connect (minimal lab) | agent README |
| [11-durable-resume](11-durable-resume/) | Durable session + sandbox reconnect | `npm run test:durable` |
| [16-eval-self](16-eval-self/) | Self-verifying dual-method answers | agent README |
| [20-swarm](20-swarm/) | Parallel isolated SuperServe sandboxes | agent README |

## When to use which

| Need | Go to |
| --- | --- |
| Tool approval API | `08-hitl` or catalog A05 / reference `agent-tools-hitl` |
| Slack on deploy | catalog A06 + [docs/CONNECT.md](../../docs/CONNECT.md) |
| Session survives restart | `11-durable-resume` |
| Fan-out isolated VMs | `20-swarm` or `swarm_run` in agent-kit |

## Durable resume note

Do **not** set `EVE_FRESH_SESSION=1` or run `cleanup:superserve` without `--all` while testing durable resume — those destroy the sandbox state under test.

## Run proofs

```bash
bash scripts/setup.sh
npm run test:hitl
npm run test:durable
```