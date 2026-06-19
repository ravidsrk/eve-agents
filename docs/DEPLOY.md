# Deploy an eve catalog agent on Vercel

> **Status:** Phase 1 ready — flagship `06-incident-commander` uses `@eve-catalog/profile` dual-track runtime.

## Prerequisites

- Vercel account (Pro recommended for Connect and Cron)
- This repo cloned; agent uses dual-track profile from Phase 0 (`@eve-catalog/profile`)
- No `OPENROUTER_API_KEY` or `SUPERSERVE_API_KEY` on Vercel — inference via AI Gateway OIDC

## Quick path (Phase 1 target)

```bash
cd agents/catalog/06-incident-commander
vercel link
vercel deploy
```

Smoke the HTTP API:

```bash
export URL="https://<preview>.vercel.app"
curl -X POST "$URL/eve/v1/session" \
  -H 'content-type: application/json' \
  -d '{"message":"Load the dossier, analyze records, and write a prioritized incident report."}'
```

Eval against deployment:

```bash
npx eve eval --base-url "$URL" --strict
```

## Live verification (lab)

```bash
npm run eval:flagship          # 4/4 evals on 06-incident-commander
npm run eval:s-tier            # all 5 S-tier agents (strict)
npm run eval:hitl-catalog      # HITL approval on 05-refund-approval-operator
npm run deploy:flagship        # eve build (+ vercel deploy if VERCEL_TOKEN set)
```

## Observability

After deploy, open **Vercel dashboard → Observability → Agent Runs** for sessions, tools, and token usage.

## Connect (Phase 4)

Slack/GitHub channels use [Vercel Connect](https://vercel.com/connect). See [ROADMAP.md](../ROADMAP.md#phase-4--channels-connect--second-deploy-wave) and `agents/integrations/10-slack/README.md` for the lab-proven pattern.

## Full plan

[ROADMAP.md](../ROADMAP.md)