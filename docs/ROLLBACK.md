# Rollback drill

Revert a bad catalog deployment without changing repo code.

## When to rollback

- `/eve/v1/health` returns 5xx on production URL
- Agent Runs error rate spike after `vercel deploy --prebuilt --prod`
- Auth regression (401 on all sessions after env change)

## A06 incident commander

```bash
cd agents/catalog/06-incident-commander
vercel deployments ls
vercel rollback <previous-deployment-url>   # or promote prior deployment in dashboard

npm run smoke:deployed -- https://eve-incident-commander.vercel.app .
ALERT_WEBHOOK_SECRET=... bash ../../scripts/smoke-alert-webhook.sh
```

## A04 support triage

Same flow after linking project `eve-support-triage`:

```bash
npm run deploy:support
npm run smoke:deployed -- https://eve-support-triage.vercel.app agents/catalog/04-support-ticket-triage
```

## Env vars to preserve across rollback

| Variable | Why |
| --- | --- |
| `ROUTE_AUTH_BASIC_USER` / `PASSWORD` | HTTP session smoke |
| `ALERT_WEBHOOK_SECRET` | A06 webhook only |
| Connect / GitHub secrets | Slack and PR triage channels |

## Prevention

- Run `npm run deploy:flagship` (local prebuilt build) before `--prod`
- Smoke immediately: `npm run smoke:deployed`
- Keep structure green on `main`: `npm run test:structure`
- Reference parity: `npm run validate:reference` (with keys)

## Related

- [DEPLOY.md](./DEPLOY.md)
- [COST-RUNBOOK.md](./COST-RUNBOOK.md)