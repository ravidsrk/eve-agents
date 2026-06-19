# A06 Connect + channels evidence

**Date:** 2026-06-19

## Verified (automated)

| Path | Proof |
| --- | --- |
| HTTP health | `GET /eve/v1/health` → 200 on https://eve-incident-commander.vercel.app |
| HTTP session | `POST /eve/v1/session` with `ROUTE_AUTH_BASIC_*` → 202 + `sessionId` |
| Alert webhook | `webhook-alert.eval.ts` — POST `/incident` (5/5 flagship evals) |
| Slack channel file | `agent/channels/slack.ts` + `@vercel/connect` |

## Live Slack (manual — Connect)

Slack delivery requires Vercel Connect on the deployed project:

```bash
export FF_CONNECT_ENABLED=1
vercel connect create slack --triggers
vercel connect attach <uid> --trigger-path /eve/v1/slack --triggers --yes
npm run deploy:flagship && vercel deploy --prebuilt --prod
```

Until Connect is attached, the **HTTP alert webhook** is the production integration path (`scripts/smoke-alert-webhook.sh`).