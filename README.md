# Eve Agents

Community library of **[Vercel eve](https://vercel.com/docs/eve) agents** — 50 job templates plus framework reference, depth examples, and integration proofs. Run locally, eval, and deploy.

| Layer | Path | Count | What |
| --- | --- | ---: | --- |
| **Templates** | [`agents/catalog/`](agents/catalog/) | 50 | Real-world job templates |
| **Framework reference** | [`agents/reference/`](agents/reference/) | 10 | Ported vercel/eve e2e fixtures + evals |
| **Depth examples** | [`agents/production/`](agents/production/) | 10 | Custom tools + Monid on selected jobs |
| **Primitive proofs** | [`agents/integrations/`](agents/integrations/) | 5 | HITL, Slack, durability, swarm |

**Docs hub:** [docs/README.md](docs/README.md) · **Index:** [AGENT_CATALOG.md](AGENT_CATALOG.md) · **Plan:** [ROADMAP.md](ROADMAP.md)

## Quick start

**Requirements:** Node 24+, npm, API keys in environment or `.secrets/eve.env`.

```bash
bash scripts/setup.sh          # npm ci + create .secrets/eve.env if missing
npm run test:structure         # keyless structure gate (~10s)

# Run the flagship template agent locally
bash scripts/run-catalog-agent.sh agents/catalog/06-incident-commander 3206 \
  "Load the dossier, analyze records, and write a prioritized action report."

# Reference evals (vercel/eve fixtures)
cd agents/reference/agent-tools && npx eve eval --strict
```

### Secrets

Keys live in **one file**: `.secrets/eve.env` at the repo root (not copied into each agent).

| Key | Used for |
| --- | --- |
| `OPENROUTER_API_KEY` | Lab inference (`eve dev`, `eve eval`) |
| `SUPERSERVE_API_KEY` | Lab sandboxes (optional locally) |
| `MONID_API_KEY` | Depth example agents p01–p10 only |
| `VERCEL_TOKEN` | `npm run deploy:*` scripts (optional) |

See [docs/SECURITY.md](docs/SECURITY.md) for deploy auth and webhook secrets.

### Tracks

| Track | When | Inference | Sandbox |
| --- | --- | --- | --- |
| **Lab** | Local dev, CI with keys | OpenRouter | SuperServe (when keyed) |
| **Vercel** | `npm run deploy:flagship` | AI Gateway + OIDC | Vercel Sandbox |

Resolution is automatic via `@eve-agents/profile` — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Deploy flagship (5 minutes)

```bash
vercel login
cd agents/catalog/06-incident-commander && vercel link --yes
```

On the Vercel project, set:

- `ROUTE_AUTH_BASIC_USER` + `ROUTE_AUTH_BASIC_PASSWORD` — HTTP session access
- `ALERT_WEBHOOK_SECRET` — required for `POST /incident` ingestion

```bash
npm run deploy:flagship
npm run smoke:deployed -- https://eve-incident-commander.vercel.app agents/catalog/06-incident-commander
```

**Live:** [eve-incident-commander.vercel.app](https://eve-incident-commander.vercel.app) · Guide: [docs/DEPLOY.md](docs/DEPLOY.md)

## Repository layout

```text
agents/           templates, reference, depth examples, integrations
packages/         @eve-agents/* shared libraries
scripts/          setup, runners, verify, deploy
docs/             deploy, security, architecture, runbooks
AGENT_CATALOG.md  Full agent index with tiers and ports (folder paths unchanged)
```

## Commands

### Verify (keyless)

| Command | Purpose |
| --- | --- |
| `npm test` | Full structure suite |
| `npm run verify:catalog` | 50 catalog agents — layout + dossier |
| `npm run verify:runtime` | Dual-track snippets in agent source |
| `npm run catalog:list` | JSON index of all 75 agents |

### Eval (needs keys)

| Command | Purpose |
| --- | --- |
| `npm run eval:flagship` | A06 incident commander (5 evals, strict) |
| `npm run eval:s-tier` | All 5 S-tier agents |
| `npm run eval:a-tier` | A-tier agents + HITL |
| `npm run validate:reference` | All 10 reference fixtures (run `cleanup:superserve` first if quota tight) |
| `npm run eval:hitl-catalog` | HITL on A05 refund operator |

### Deploy and smoke

| Command | Purpose |
| --- | --- |
| `npm run deploy:flagship` | Prebuilt deploy A06 |
| `npm run deploy:support` | Prebuilt deploy A04 |
| `npm run smoke:deployed` | Health + session on a deployment URL |
| `npm run smoke:production:build` | `eve build` all P01–P10 |

### Integrations

| Command | Purpose |
| --- | --- |
| `npm run test:hitl` | HITL proof (`integrations/08-hitl`) |
| `npm run test:durable` | Durable resume (`integrations/11-durable-resume`) |
| `npm run cleanup:superserve` | Free SuperServe quota before sandbox evals |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs should pass `npm test` and `npm run typecheck`.

## Credits

Agents ported from [vercel/eve](https://github.com/vercel/eve). Lab inference via OpenRouter; sandboxes via SuperServe; hosted inference via Vercel AI Gateway.