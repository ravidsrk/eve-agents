# P05 — Support ticket router

Classify tickets, search knowledge, draft grounded replies, flag human escalation.

| Tool | Endpoint | ~Cost |
|------|----------|-------|
| `search_knowledge` | blockrun `exa/search` | $0.011 |
| `draft_reply` | blockrun `exa/answer` | $0.011 |

```bash
cd agents/production/p05-support-router && npx eve dev --no-ui --port 3305
```