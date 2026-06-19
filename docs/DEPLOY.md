# Deploy an eve catalog agent on Vercel

> **Status:** Phase 1 ready — flagship `06-incident-commander` uses `@eve-catalog/profile` dual-track runtime.

## Prerequisites

- Vercel account (Pro recommended for Connect and Cron)
- `vercel login` (CLI session) **or** `VERCEL_TOKEN` for scripts/CI
- This repo cloned; agent uses dual-track profile from Phase 0 (`@eve-catalog/profile`)
- No `OPENROUTER_API_KEY` or `SUPERSERVE_API_KEY` on Vercel — inference via AI Gateway OIDC
- Set `ROUTE_AUTH_BASIC_USER` + `ROUTE_AUTH_BASIC_PASSWORD` on the Vercel project for HTTP session access (`catalogRouteAuth`)

## Quick path (monorepo + prebuilt)

Workspace packages (`@eve-catalog/*`) are not on npm — build locally, deploy prebuilt:

```bash
vercel login
cd agents/catalog/06-incident-commander && vercel link --yes
npm run deploy:flagship          # npm ci @ root → VERCEL=1 eve build → vercel deploy --prebuilt
vercel deploy --prebuilt --prod  # optional: promote to production alias
```

Production alias (when promoted): `https://eve-incident-commander.vercel.app`

Smoke the HTTP API:

```bash
export URL="https://<preview>.vercel.app"
curl -X POST "$URL/eve/v1/session" \
  -H 'content-type: application/json' \
  -d '{"message":"Load the dossier, analyze records, and write a prioritized incident report."}'
```

Eval against deployment:

```bash
npx eve eval --url "$URL" --strict
```

## Live verification (lab)

```bash
npm run eval:flagship          # 4/4 evals on 06-incident-commander
npm run eval:s-tier            # all 5 S-tier agents (strict)
npm run eval:a-tier            # A-tier agents + HITL (02, 33, 39, 50, 05)
npm run eval:hitl-catalog      # HITL approval on 05-refund-approval-operator
npm run deploy:flagship        # A06 prebuilt deploy (CLI login or VERCEL_TOKEN)
npm run deploy:support         # A04 second-wave deploy
npm run deploy:catalog -- 06-incident-commander  # generic catalog deploy
```

## Observability

After deploy, open **Vercel dashboard → Observability → Agent Runs** for sessions, tools, and token usage.

## Connect (Phase 4)

Slack on A06 and GitHub on A11 use [Vercel Connect](https://vercel.com/connect). See [CONNECT.md](./CONNECT.md).

## Full plan

[ROADMAP.md](../ROADMAP.md)