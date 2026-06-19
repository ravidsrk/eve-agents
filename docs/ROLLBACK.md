# Rollback drill — catalog flagships

## When to rollback

- Deployed agent returns 5xx on `/eve/v1/health`
- Session error rate spike in Agent Runs
- Bad release after `vercel deploy --prebuilt --prod`

## Steps (A06 incident commander)

```bash
cd agents/catalog/06-incident-commander
vercel deployments ls
vercel rollback <previous-deployment-url>   # or promote prior deployment in dashboard
bash ../../scripts/smoke-deployed.sh https://eve-incident-commander.vercel.app .
```

## A04 support triage

Same flow with project `eve-support-triage` after link/deploy.

## Prevention

- Always run `npm run deploy:flagship` (local prebuilt build) before `--prod`
- Keep `ROUTE_AUTH_BASIC_*` env vars stable across rollbacks
- Reference evals on main: `npm run validate:reference`