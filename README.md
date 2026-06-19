# eve-exploration

Public catalog of **[Vercel eve](https://vercel.com/docs/eve) agents** — 75 working agents with live evidence.

| Layer | Path | Count | What |
| --- | --- | ---: | --- |
| **Catalog** | [`agents/catalog/`](agents/catalog/) | 50 | Real-world job templates |
| **Reference** | [`agents/reference/`](agents/reference/) | 10 | Ported vercel/eve e2e fixtures + evals |
| **Production** | [`agents/production/`](agents/production/) | 10 | Deep agents with custom tools |
| **Integrations** | [`agents/integrations/`](agents/integrations/) | 5 | Eve primitive proofs (HITL, Slack, durability, swarm) |

→ **[AGENT_CATALOG.md](AGENT_CATALOG.md)** · **[ROADMAP.md](ROADMAP.md)** · `npm run catalog:list`

## Quick start

```bash
bash scripts/setup.sh
npm run verify:catalog

# Run a catalog agent
bash scripts/run-catalog-agent.sh agents/catalog/06-incident-commander 3206 \
  "Load the dossier, analyze records, and write a prioritized action report."

# Run reference evals (vercel/eve fixtures)
cd agents/reference/agent-tools && npx eve eval --strict
```

Keys for live runs: `OPENROUTER_API_KEY`, `SUPERSERVE_API_KEY` in `.secrets/eve.env`.

### Tracks

| Track | When | Inference | Sandbox |
| --- | --- | --- | --- |
| **Lab** (today) | Local dev, CI structure | OpenRouter (`@eve-catalog/openrouter`) | SuperServe (`@eve-catalog/superserve-backend`) |
| **Vercel** | `npm run deploy:flagship` | AI Gateway + OIDC | Vercel Sandbox (default) |

**Deploy incident commander in 5 minutes**

```bash
vercel login
cd agents/catalog/06-incident-commander && vercel link --yes
# Set ROUTE_AUTH_BASIC_USER + ROUTE_AUTH_BASIC_PASSWORD in Vercel project env
npm run deploy:flagship
npm run smoke:deployed -- https://eve-incident-commander.vercel.app agents/catalog/06-incident-commander
```

Production: [eve-incident-commander.vercel.app](https://eve-incident-commander.vercel.app) · Docs: [Vercel eve](https://vercel.com/docs/eve) · [DEPLOY.md](docs/DEPLOY.md)

## Layout

```text
agents/           All eve agents (catalog, reference, production, integrations)
packages/         @eve-catalog/profile, openrouter, superserve-backend, agent-kit, monid-tools
scripts/          setup, runners, catalog tools
AGENT_CATALOG.md  Full index
VERIFY-LIVE.md    Live run evidence (catalog 50/50)
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Full structure suite: catalog + runtime + evals + profile tests |
| `npm run test:structure` | Same as `npm test` (keyless) |
| `npm run eval:flagship` | `eve eval --strict` on 06-incident-commander (5 evals, needs keys) |
| `npm run eval:s-tier` | All 5 S-tier agents (strict, needs keys) |
| `npm run eval:a-tier` | A-tier agents + HITL (needs keys) |
| `npm run eval:hitl-catalog` | HITL approval proof on 05-refund-approval-operator |
| `npm run deploy:flagship` | Prebuilt deploy for A06 (CLI login or `VERCEL_TOKEN`) |
| `npm run deploy:support` | Prebuilt deploy for A04 |
| `npm run smoke:deployed` | Health + session smoke on a deployment URL |
| `npm run eval:catalog:rotate` | Rotating B-tier smoke evals (CI) |
| `npm run smoke:production:build` | `eve build` all P01–P10 |
| `npm run catalog:list` | JSON index of all 75 agents |
| `npm run validate:reference` | `eve eval --strict` on reference fixtures |
| `npm run run:production:all` | Live batch production agents |
| `npm run test:hitl` | HITL proof (`integrations/08-hitl`) |
| `npm run test:durable` | Durable resume proof (`integrations/11-durable-resume`) |

## Credits

Agents ported from [vercel/eve](https://github.com/vercel/eve). Inference via OpenRouter; sandboxes via SuperServe.