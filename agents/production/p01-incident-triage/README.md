# P01 — Incident triage

On-call agent that parses logs, explains errors, and drafts a triage brief + postmortem skeleton.

## Monid endpoints

| Tool | Provider | Endpoint | ~Cost |
|------|----------|----------|-------|
| `parse_logs` | api.strale.io | `/x402/log-parse` | $0.011 |
| `explain_error` | api.strale.io | `/x402/error-explain` | $0.011 |

Discovered via `npm run research:monid` (query: "SRE log analysis root cause").

## Run

```bash
bash scripts/setup.sh
cd agents/production/p01-incident-triage
npx eve dev --no-ui --port 3301
```

Example prompt: *"Triage the outage in sample-incident.log — severity, root cause, mitigations."*

## Credits

- Monid research layer — [monid.ai/SKILL.md](https://monid.ai/SKILL.md)
- eve agent runtime — [vercel/eve](https://github.com/vercel/eve)