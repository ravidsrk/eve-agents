# Vercel Connect for eve catalog agents

Connect supplies OAuth credentials to eve channels without storing raw tokens in your repo. The same agent logic runs on the default HTTP channel locally; Connect enables live delivery on deploy.

## Prerequisites

- Vercel Pro (Connect + Cron)
- Agent deployed with `eve build` + `vercel deploy --prebuilt`
- `FF_CONNECT_ENABLED=1` during connector setup
- HTTP route auth configured — see [SECURITY.md](./SECURITY.md)

## Slack — A06 Incident Commander

Channel: `agents/catalog/06-incident-commander/agent/channels/slack.ts`

```bash
cd agents/catalog/06-incident-commander
export FF_CONNECT_ENABLED=1

vercel connect create slack --triggers
vercel connect attach <connector-uid> \
  --trigger-path /eve/v1/slack \
  --triggers --yes

npm run build
vercel deploy --prebuilt --prod
```

Dogfood: `@mention` the bot with an incident summary. Tools match HTTP (`load_dossier`, `search_records`, `write_report`).

## Alert webhook — authenticated ingestion

Channel: `agent/channels/alert.ts` — `POST /incident`

**Requires `ALERT_WEBHOOK_SECRET`** on the Vercel project. Without the correct header, the route returns `401` and does not start a session.

```bash
curl -X POST "https://<deployment>/incident" \
  -H 'content-type: application/json' \
  -H "x-alert-webhook-secret: $ALERT_WEBHOOK_SECRET" \
  -d '{"title":"DB latency spike","reference":"INC-42","severity":"high"}'
```

Local proof: `npm run eval:flagship` includes `webhook-alert.eval.ts`.

### Cross-channel flow

1. Monitoring sends authenticated `POST /incident`
2. Agent triages on the alert channel session
3. Optional Slack thread via Connect or proactive `receive(slack, …)`

## GitHub — A11 PR Triage

Channel: `agents/catalog/11-pr-triage-reviewer/agent/channels/github.ts`

Set on the Vercel project:

```bash
GITHUB_APP_ID=...
GITHUB_APP_PRIVATE_KEY=...   # PEM
GITHUB_WEBHOOK_SECRET=...
GITHUB_APP_SLUG=pr-triage-bot
```

Point the GitHub App webhook to `https://<deployment>/eve/v1/github`.

## Connector reference

| Agent | Connect slug | Route |
| --- | --- | --- |
| A06 Slack | `slack/incident-commander` | `/eve/v1/slack` |
| integrations/10-slack (lab) | `slack/lab` | `/eve/v1/slack` |

Prefer the A06 catalog pattern for new work.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| 404 on `/eve/v1/slack` | `eve channels list` after build; redeploy after adding channel |
| Connect attach fails | `FF_CONNECT_ENABLED=1`, CLI logged in |
| GitHub webhook 401 | `GITHUB_WEBHOOK_SECRET` matches App settings |
| `/incident` always 401 | `ALERT_WEBHOOK_SECRET` set; header name matches smoke script |
| HTTP works, Slack silent | Connector attached to correct trigger path and URL |

## Related

- [DEPLOY.md](./DEPLOY.md) — build, smoke, eval
- [SECURITY.md](./SECURITY.md) — auth env vars