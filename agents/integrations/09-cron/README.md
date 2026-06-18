# 09 · Scheduled / Cron Agent

**Rationale.** Agents that fire on a cadence, not just on user input. `agent/schedules/heartbeat.ts`
declares a `defineSchedule` (cron `*/5 * * * *`, markdown task mode). On Vercel each schedule becomes
a Cron Job; locally `eve dev` never fires crons on cadence, so you trigger one via the dev dispatch
route.

**Stack.** OpenRouter `openai/gpt-oss-120b` · no sandbox.

## Run
```bash
cd agents/integrations/09-cron && npx eve dev --no-ui --port 3119
curl -XPOST localhost:3119/eve/v1/dev/schedules/heartbeat   # -> { scheduleId, sessionIds:[...] }
curl -sN localhost:3119/eve/v1/session/<sessionId>/stream
```

## Proof (see `run.log`)
`POST /eve/v1/dev/schedules/heartbeat` → `{"scheduleId":"heartbeat","sessionIds":["wrun_..."]}`.
The fired session called `record_heartbeat` → `{ totalHeartbeats: 1 }`; reply: *"Heartbeat recorded.
Total heartbeats so far: 1."*

## Cost notes
One short turn per fire. ≈ $0.0003.
