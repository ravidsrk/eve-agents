# Vercel Connect for eve catalog agents

> **Status:** Phase 4 — Slack on A06 (`06-incident-commander`), GitHub on A11 (`11-pr-triage-reviewer`).

Connect supplies OAuth credentials to eve channels without storing raw tokens in your repo. The same agent logic runs on the default HTTP channel locally; Connect enables live delivery on deploy.

## Prerequisites

- Vercel Pro (Connect + Cron)
- Agent deployed with `eve build` + `vercel deploy`
- `FF_CONNECT_ENABLED=1` during connector setup

## Slack — A06 Incident Commander

Channel file: `agents/catalog/06-incident-commander/agent/channels/slack.ts`

```bash
cd agents/catalog/06-incident-commander
export FF_CONNECT_ENABLED=1

vercel connect create slack --triggers
vercel connect attach <connector-uid> \
  --trigger-path /eve/v1/slack \
  --triggers --yes

npm run build
vercel deploy --prod
```

Dogfood: `@mention` the bot in a channel with an incident summary. The agent uses the same tools and playbook as HTTP (`load_dossier`, `search_records`, `write_report`).

### Cross-channel flow (A06)

1. **Alert webhook** — `POST /incident` on the alert channel with `{ title, reference, severity }` (see `agent/channels/alert.ts`; on deploy the path is under the channel mount)
2. Agent triages on the alert channel session
3. Optional **Slack thread** — proactive `receive(slack, …)` from a schedule or manual ops run

Local proof: `npm run eval:flagship` includes `webhook-alert.eval.ts`.

## GitHub — A11 PR Triage

Channel file: `agents/catalog/11-pr-triage-reviewer/agent/channels/github.ts`

Set on the Vercel project:

```bash
GITHUB_APP_ID=...
GITHUB_APP_PRIVATE_KEY=...   # PEM
GITHUB_WEBHOOK_SECRET=...
GITHUB_APP_SLUG=pr-triage-bot
```

Point the GitHub App webhook to `https://<deployment>/eve/v1/github`. `@mention` the bot on a PR to triage with `analyze_diff` and seeded patch context.

## Connector slug reference

| Agent | Connect slug | Route |
| --- | --- | --- |
| A06 Slack | `slack/incident-commander` | `/eve/v1/slack` |
| integrations/10-slack (legacy) | `slack/lab` | `/eve/v1/slack` |

Prefer the A06 catalog pattern for new work; `integrations/10-slack` remains a minimal lab proof.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| 404 on `/eve/v1/slack` | `eve channels list` after build; redeploy after adding channel file |
| Connect attach fails | `FF_CONNECT_ENABLED=1`, Vercel CLI logged in |
| GitHub webhook 401 | `GITHUB_WEBHOOK_SECRET` matches App settings |
| HTTP works, Slack silent | Connector attached to correct trigger path and deployment URL |

## Related

- [DEPLOY.md](./DEPLOY.md) — build, smoke `curl`, eval against preview URL
- [ROADMAP.md](../ROADMAP.md) — Phase 4 deliverables