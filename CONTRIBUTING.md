# Contributing to eve-exploration

## Add catalog agent #51

1. Add a row to [AGENT_MATRIX.md](AGENT_MATRIX.md).
2. Run `npm run generate:catalog` (or copy an existing `agents/catalog/NN-slug` tree).
3. Ensure `agent/channels/eve.ts` uses `catalogRouteAuth()` from `@eve-catalog/agent-kit/route-auth`.
4. Add `evals/smoke-dossier.eval.ts` + `evals/evals.config.ts` (or `npm run scaffold:evals`).
5. `npm run verify:catalog && npm run verify:evals` from repo root.

## Dual-track runtime

All catalog agents use `@eve-catalog/profile`:

- **Lab:** `OPENROUTER_API_KEY` + optional `SUPERSERVE_API_KEY`
- **Vercel:** `VERCEL=1` build → AI Gateway OIDC, default sandbox

## Deploy a catalog agent

```bash
vercel login
cd agents/catalog/06-incident-commander && vercel link --yes
npm run deploy:flagship
```

Set on Vercel: `ROUTE_AUTH_BASIC_USER`, `ROUTE_AUTH_BASIC_PASSWORD` for HTTP session access.

## Port upstream reference fixtures

```bash
bash scripts/port-eve-fixture.sh <fixture-name>
npm run validate:reference
```

## PR checklist

- [ ] `npm test` (keyless structure)
- [ ] `npm run typecheck`
- [ ] Flagship evals if touching A06: `npm run eval:flagship`
- [ ] S-tier changes: `npm run eval:s-tier` (needs keys)