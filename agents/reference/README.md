# Reference agents

**10 ported [vercel/eve](https://github.com/vercel/eve) e2e fixtures** — authoritative examples of eve primitives with upstream-aligned evals.

Use these to **learn the framework** and validate local parity, not as product templates. For job-shaped agents see [catalog/](../catalog/).

## Fixtures

| Directory | Primitive |
| --- | --- |
| [agent-basic-runtime](agent-basic-runtime/) | Minimal agent + session |
| [agent-tools](agent-tools/) | Tools, dynamic tools, nested calls |
| [agent-tools-sandbox](agent-tools-sandbox/) | SuperServe file/exec tools |
| [agent-tools-hitl](agent-tools-hitl/) | Tool approval pause/resume |
| [agent-subagents](agent-subagents/) | Delegation to subagents |
| [agent-subagents-hitl](agent-subagents-hitl/) | Subagents + HITL |
| [agent-channels](agent-channels/) | Multi-channel routing |
| [agent-schedules](agent-schedules/) | Cron schedules |
| [agent-skills](agent-skills/) | Agent skills |
| [agent-openapi-swagger](agent-openapi-swagger/) | OpenAPI surface |

## Quick run

```bash
bash scripts/setup.sh
cd agents/reference/agent-tools
npx eve eval --strict
npx eve dev --no-ui --port 3101
```

## Validate all fixtures

```bash
npm run cleanup:superserve    # recommended if SuperServe quota is low
npm run validate:reference
```

Expected: **9/10** pass on OpenRouter lab track; `agent-tools` may flake on long concurrent dev-server runs. Details: [docs/VERIFY-REFERENCE.md](../../docs/VERIFY-REFERENCE.md).

## Port another upstream fixture

```bash
bash scripts/port-eve-fixture.sh agent-tools-hitl
npm run validate:reference
```

## Lab track notes

Reference fixtures use OpenRouter for inference and SuperServe for sandbox agents. Subagent fixtures set `modelContextWindowTokens` where required. See [packages/README.md](../../packages/README.md).