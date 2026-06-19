# Deploy an eve catalog agent on Vercel

Deploy prebuilt eve agents from this monorepo. Workspace packages (`@eve-agents/*`) are **not on npm** — you build locally, then upload the build output.

## Prerequisites

- Vercel account (Pro recommended for Connect and Cron)
- `vercel login` or `VERCEL_TOKEN` in the environment
- Node 24+ and `npm ci` at repo root
- **No** `OPENROUTER_API_KEY` or `SUPERSERVE_API_KEY` on Vercel — inference uses AI Gateway OIDC

## Environment variables (flagship A06)

| Variable | Required | Purpose |
| --- | ---: | --- |
| `ROUTE_AUTH_BASIC_USER` | Yes | HTTP basic auth for `/eve/v1/session` |
| `ROUTE_AUTH_BASIC_PASSWORD` | Yes | Pair with user above |
| `ALERT_WEBHOOK_SECRET` | Yes | Shared secret for `POST /incident` webhook |
| `EVE_VERCEL_MODEL` | No | Override default `openai/gpt-5.4-mini` |

See [SECURITY.md](./SECURITY.md) for rotation and webhook header format.

## Quick path (prebuilt)

```bash
vercel login
cd agents/catalog/06-incident-commander && vercel link --yes
npm run deploy:flagship          # root: npm ci → VERCEL=1 eve build → vercel deploy --prebuilt
vercel deploy --prebuilt --prod  # optional: promote to production alias
```

Production alias: `https://eve-incident-commander.vercel.app`

### Smoke HTTP session

```bash
URL="https://eve-incident-commander.vercel.app"
USER="eve-agents"
PASS="your-basic-auth-password"

curl -u "$USER:$PASS" -X POST "$URL/eve/v1/session" \
  -H 'content-type: application/json' \
  -d '{"message":"Load the dossier, analyze records, and write a prioritized incident report."}'
```

Or use the helper:

```bash
npm run smoke:deployed -- "$URL" agents/catalog/06-incident-commander
```

### Smoke alert webhook

```bash
ALERT_WEBHOOK_SECRET=your-secret bash scripts/smoke-alert-webhook.sh
```

### Eval against deployment

```bash
npx eve eval --url "$URL" --strict
# or
npm run eval:deployed:flagship -- "$URL"
```

Deployed evals may hit AI Gateway rate limits on free tier; structure tests and lab evals are the primary CI gates.

## Other deploy targets

| Script | Agent |
| --- | --- |
| `npm run deploy:flagship` | A06 incident commander |
| `npm run deploy:support` | A04 support triage |
| `npm run deploy:catalog -- <dir>` | Any catalog agent directory |

`deploy-catalog.sh` uses `VERCEL_TOKEN` from the environment (not `--token` on argv).

## Observability

Vercel dashboard → **Observability → Agent Runs** — sessions, tools, tokens, errors.

Flagship ships `agent/instrumentation.ts` for optional OTEL export (`OTEL_EXPORTER_OTLP_ENDPOINT`).

## Connect (Slack, GitHub)

Slack on A06 and GitHub on A11 use [Vercel Connect](https://vercel.com/connect). See [CONNECT.md](./CONNECT.md).

## Related

- [ARCHITECTURE.md](./ARCHITECTURE.md) — dual-track runtime
- [ROLLBACK.md](./ROLLBACK.md) — revert a bad deployment
- [COST-RUNBOOK.md](./COST-RUNBOOK.md) — spend monitoring
- [ROADMAP.md](../ROADMAP.md) — phased delivery history