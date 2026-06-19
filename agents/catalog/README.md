# Catalog agents (Layer A)

**50 real-world job templates** — each is a deployable eve agent with seeded data, six shared tools, a playbook skill, and smoke evals.

## Structure (every agent)

```text
NN-slug/
  agent/
    agent.ts              defineAgent + resolveModel()
    channels/eve.ts       routeAuth() on HTTP
    instructions.md
    data/dossier.json
    data/records.json
    tools/*.ts            re-exports from @eve-catalog/agent-kit
    sandbox/sandbox.ts    resolveSandboxDefinition()
    skills/operating-playbook/SKILL.md
  evals/
    smoke-dossier.eval.ts
    evals.config.ts
  package.json
  README.md
```

Hand-customized agents add channels, schedules, or extra evals and mark themselves with `.generated=false` so `generate:catalog` does not overwrite them.

## Tiers

See [AGENT_CATALOG.md](../../AGENT_CATALOG.md) for the full index. Highlights:

| Tier | Agents | Notes |
| --- | --- | --- |
| **S** | A06, A04, A11, A33, A39 | Flagship deploy + strict evals |
| **A** | A02, A05, A07, A20, A50 | Strong eval coverage |
| **B** | Remaining | Rotating CI smoke via `eval:catalog:rotate` |

## Run locally

```bash
bash scripts/run-catalog-agent.sh agents/catalog/06-incident-commander 3206 \
  "Load the dossier and write a prioritized report."
```

Requires `.secrets/eve.env` at repo root with `OPENROUTER_API_KEY` (and `SUPERSERVE_API_KEY` for sandbox tools).

## Flagship: incident commander (A06)

- **Deploy:** `npm run deploy:flagship`
- **Production:** https://eve-incident-commander.vercel.app
- **Extra channels:** Slack, authenticated alert webhook
- **Docs:** [06-incident-commander/README.md](06-incident-commander/README.md)

## Regenerate templates

```bash
npm run generate:catalog              # refresh generated agents only
npm run generate:catalog -- --clean   # remove generator-owned files first (safe for customized agents)
```

## Verify

```bash
npm run verify:catalog
npm run verify:evals
npm run eval:flagship    # A06, needs keys
```