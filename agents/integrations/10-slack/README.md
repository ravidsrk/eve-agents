# 10 · Slack Channel Agent (customer support)

**Rationale.** A channel agent that lives where the team works. `agent/channels/slack.ts` wires
eve's Slack channel (`slackChannel` + `connectSlackCredentials`), which answers `@mentions`/DMs in
threads and renders HITL prompts as buttons. The default HTTP channel serves the *same* agent, so
the support logic is testable locally.

**Stack.** OpenRouter `openai/gpt-oss-120b` · eve Slack channel (Vercel Connect) · no sandbox.

## Run (local, HTTP)
```bash
bash ../../scripts/run-catalog-agent.sh agents/integrations/10-slack 3130 "What's in the free tier, and how do I reset my password?"
```

## Proof
- `eve info` → `Compile ready, 0 errors`; `eve channels list` → **slack** (channel discovered).
- Over HTTP the agent answered correctly from its support KB: free tier = 1 project / 100 runs;
  password reset via **Settings → Security → Reset password** (emailed link, valid 30 min); offered
  human escalation for out-of-scope questions (see `run.log`).

## Live Slack delivery (not run here)
Real Slack events require Vercel Connect + a deployment (no raw `SLACK_BOT_TOKEN`):
```bash
export FF_CONNECT_ENABLED=1
vercel connect create slack --triggers
vercel connect attach <uid> --trigger-path /eve/v1/slack --triggers --yes
VERCEL_USE_EXPERIMENTAL_FRAMEWORKS=1 vercel deploy --prod
```
This lab has no Vercel project/Slack workspace, so delivery is documented, not executed; the agent
behavior is proven via the HTTP channel (the same runtime Slack would invoke).

## Cost notes
~few k tokens, no sandbox. ≈ $0.0004.
