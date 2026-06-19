# Contributing to Eve Agents

## Setup

```bash
bash scripts/setup.sh    # Node 24 check, .secrets/eve.env, npm ci
npm run test:structure   # keyless gate before every PR
```

Secrets stay in **`.secrets/eve.env`** at the repo root. Do not copy keys into per-agent `.env.local` files.

## Add catalog agent #51

1. Add a row to [AGENT_MATRIX.md](AGENT_MATRIX.md).
2. Run `npm run generate:catalog` (copies template from `scripts/generate-catalog.mjs`).
3. Ensure `agent/channels/eve.ts` uses `routeAuth()` from `@eve-agents/agent-kit/route-auth`.
4. Add evals: `evals/smoke-dossier.eval.ts` + `evals/evals.config.ts` (or `npm run scaffold:evals`).
5. Verify: `npm run verify:catalog && npm run verify:evals`.

### Hand-customized agents

If you add files the generator does not produce (extra channels, schedules, custom evals), add:

```text
agents/catalog/NN-slug/.generated=false
```

`npm run generate:catalog -- --clean` will then **skip** that directory entirely. Without the marker, `--clean` only removes generator-owned paths.

**Example:** `06-incident-commander` is hand-customized (alert, Slack, instrumentation, cron).

## Dual-track runtime

All catalog agents use `@eve-agents/profile`:

| Track | Env signal | Model | Sandbox |
| --- | --- | --- | --- |
| Lab | default locally | OpenRouter | SuperServe (if keyed) |
| Vercel | `VERCEL=1` at build | AI Gateway OIDC | Vercel default |

Production agents use the same `resolveModel()` pattern — see `agents/production/p06-sql-analyst/agent/agent.ts`.

## Deploy a catalog agent

```bash
vercel login
cd agents/catalog/06-incident-commander && vercel link --yes
npm run deploy:flagship
```

Vercel env: `ROUTE_AUTH_BASIC_*`, and for A06 also `ALERT_WEBHOOK_SECRET`. Details: [docs/DEPLOY.md](docs/DEPLOY.md).

## Port upstream reference fixtures

```bash
bash scripts/port-eve-fixture.sh <fixture-name>
npm run cleanup:superserve   # if sandbox quota exhausted
npm run validate:reference
```

## PR checklist

- [ ] `npm test` (structure + package unit tests)
- [ ] `npm run typecheck`
- [ ] No secrets, tokens, or `run.log` in the diff
- [ ] Gitleaks passes (CI job on `main`)
- [ ] Flagship changes: `npm run eval:flagship` (needs keys)
- [ ] S-tier changes: `npm run eval:s-tier` (needs keys)

## Documentation

When changing behavior, update the nearest guide:

- Root behavior → [README.md](README.md)
- Deploy/auth → [docs/DEPLOY.md](docs/DEPLOY.md), [docs/SECURITY.md](docs/SECURITY.md)
- Layer conventions → `agents/<layer>/README.md`
- Shared libraries → [packages/README.md](packages/README.md)