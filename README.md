# eve-exploration

**Public catalog of real-world [Vercel eve](https://vercel.com/docs/eve) agents.**

92 working agents — reference fixtures, job templates, Monid production agents, and integration
proofs — wired for [OpenRouter](https://openrouter.ai) inference, [SuperServe](https://superserve.ai)
sandboxes, and optional [Monid](https://monid.ai) tools.

## Catalog at a glance

| Layer | Path | Agents | Purpose |
| --- | --- | ---: | --- |
| **Catalog** | [`agents/catalog/`](agents/catalog/) | 50 | Real-world job templates with live evidence |
| **Reference** | [`agents/reference/`](agents/reference/) | 10 | Ported vercel/eve fixtures with evals |
| **Production** | [`agents/production/`](agents/production/) | 10 | Monid-integrated deep agents |
| **Integrations** | [`agents/integrations/`](agents/integrations/) | 22 | HITL, MCP, Slack, durability proofs |

→ Full index: **[AGENT_CATALOG.md](AGENT_CATALOG.md)** · `npm run catalog:list`

## Quick start

```bash
# 1. Add keys to .secrets/eve.env (or export env vars), then:
bash scripts/setup.sh

# 2. Verify structure
npm run verify:catalog
npm run catalog:list

# 3. Run one catalog agent
bash scripts/run-catalog-agent.sh agents/catalog/01-revenue-analyst 3201 \
  "Review the revenue queue and write a prioritized action report."
```

Required keys for live runs: `OPENROUTER_API_KEY`, `SUPERSERVE_API_KEY`. Optional: `MONID_API_KEY`.

## Repository layout

```text
agents/
  catalog/         50 real-world job templates
  reference/       10 vercel/eve fixtures
  production/      10 Monid deep agents
  integrations/    22 integration proofs
lab/               Minimal eve lab app
packages/          @lab/openrouter, superserve-backend, monid-tools, agent-kit
scripts/           setup, runners, catalog tools
AGENT_CATALOG.md   Single source of truth
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run catalog:list` | JSON index of all 92 agents |
| `npm run verify:catalog` | Structural check on all 50 catalog agents |
| `npm run run:catalog` | Run one catalog agent (see script usage) |
| `npm run validate:reference` | Run evals on reference fixtures |
| `npm run run:production:all` | Live batch all 10 production agents |
| `npm run test:hitl` | HITL integration proof |
| `npm run test:durable` | Durable resume proof |

## Evidence

- Catalog live runs: [VERIFY-LIVE.md](VERIFY-LIVE.md) (50/50 PASS)
- Research notes: [RESEARCH.md](RESEARCH.md), [FINDINGS.md](FINDINGS.md)
- Agent matrix: [AGENT_MATRIX.md](AGENT_MATRIX.md)

## License

MIT — see [LICENSE](LICENSE) if present, or package.json.