# Agents

Public [Vercel eve](https://vercel.com/docs/eve) agent catalog — **92 agents** in four directories.

| Directory | Count | What it is |
| --- | ---: | --- |
| [`catalog/`](catalog/) | 50 | Real-world job templates — instructions, data, tools, live evidence |
| [`reference/`](reference/) | 10 | Ported vercel/eve e2e fixtures with strict evals |
| [`production/`](production/) | 10 | Monid-integrated deep agents with custom domain tools |
| [`integrations/`](integrations/) | 22 | Integration proofs (HITL, MCP, Slack, durable resume, swarm) |

Full index: [AGENT_CATALOG.md](../AGENT_CATALOG.md) · `npm run catalog:list`

## Quick start

```bash
bash scripts/setup.sh
npm run verify:catalog
```

Run a catalog agent:

```bash
bash scripts/run-catalog-agent.sh agents/catalog/06-incident-commander 3206 \
  "Load the dossier, analyze records, and write a prioritized action report."
```

Run a reference fixture with evals:

```bash
cd agents/reference/agent-tools
npx eve eval --strict
```

Run production agents:

```bash
npm run smoke:production
npm run run:production:all
```

## Choosing a layer

| You need… | Start here |
| --- | --- |
| Learn eve primitives (tools, HITL, sandbox, subagents) | `reference/` |
| Copy a real-world agent for your product | `catalog/` |
| Live external APIs via Monid | `production/` |
| Slack, MCP, durability harness, parallel VMs | `integrations/` |

## Ports (convention)

| Layer | Port range | Example |
| --- | --- | --- |
| Catalog | 3201–3250 | `06-incident-commander` → 3206 |
| Reference | 3101+ | per fixture README |
| Production | 3301–3310 | `p01-incident-triage` → 3301 |
| Integrations | 3111–3126 | `08-hitl` → 3118 |