# Security

Practices and environment variables for running and deploying agents safely.

## Secrets

| Rule | Detail |
| --- | --- |
| **Never commit** | `.secrets/eve.env`, `.env.local`, API keys, PEMs, tokens |
| **Single source** | Repo-root `.secrets/eve.env` — agents load via upward walk |
| **CI** | Gitleaks scans on every push/PR to `main` |
| **Deploy** | Pass `VERCEL_TOKEN` via env, not `--token` on the CLI argv |

Create secrets from a template:

```bash
bash scripts/setup.sh   # writes .secrets/eve.env if missing
chmod 600 .secrets/eve.env
```

## Route authentication

`routeAuth()` in `@eve-agents/agent-kit/route-auth` composes:

1. `localDev()` — loopback access in dev
2. `vercelOidc()` — Vercel deployment identity
3. Optional `httpBasic()` when both are set:

```bash
ROUTE_AUTH_BASIC_USER=eve-agents
ROUTE_AUTH_BASIC_PASSWORD=<strong-password>
```

Set these on Vercel projects for operator/curl access to `/eve/v1/session`.

## Alert webhook (A06)

The incident ingestion route requires a shared secret before starting a session:

```bash
ALERT_WEBHOOK_SECRET=<random-string>
```

Clients must send `x-alert-webhook-secret: <secret>` or `Authorization: Bearer <secret>`.

Smoke locally:

```bash
ALERT_WEBHOOK_SECRET=your-secret bash scripts/smoke-alert-webhook.sh
```

## External fetch tool

`fetch_live_json` is **disabled** unless `ALLOW_EXTERNAL_FETCH=1`. When enabled:

- HTTPS only
- Private/loopback/metadata IPs blocked
- Host must appear in `FETCH_ALLOW_HOSTS` (comma-separated)

## Monid budget (production agents)

Defaults in code: `MONID_BUDGET_USD=5`, `MONID_MAX_CALL_USD=0.25` per process.

Paid `run()` calls are serialized and logged to `MONID_COST_LOG` (defaults to OS tmpdir).

## SuperServe quota

Ephemeral harness scripts set `EVE_KILL_SANDBOX_ON_DISPOSE=1` so single-shot runs kill VMs instead of pausing them.

Before reference evals when quota is tight:

```bash
npm run cleanup:superserve
```

Use `--all` only when you intend to kill every sandbox (including active durable sessions).

## Production checklist

- [ ] `ROUTE_AUTH_BASIC_*` on deployed HTTP agents
- [ ] `ALERT_WEBHOOK_SECRET` on `eve-incident-commander`
- [ ] No API keys in Vercel env for inference (Gateway OIDC only)
- [ ] Rotate any key ever pasted into chat or committed by mistake