# Cost runbook — catalog agents on Vercel

## Inference (AI Gateway)

- **Model:** `openai/gpt-5.4-mini` via `@eve-catalog/profile` on Vercel (`resolveModel()`).
- **Where to look:** Vercel dashboard → **Observability → Agent Runs** (per session tokens, tools, latency).
- **Smoke budget:** Flagship incident playbook eval ≈ 14s / 5 evals locally; expect sub‑$0.01 per full flagship run on mini.

## Lab track (OpenRouter + SuperServe)

| Key | Used for |
| --- | --- |
| `OPENROUTER_API_KEY` | All local `eve eval` and `eve dev` |
| `SUPERSERVE_API_KEY` | Sandbox agents locally only |

## Production agents (Monid)

`agents/production/p01–p10` may call Monid when `MONID_API_KEY` is set. Catalog agents do **not** require Monid.

## Alerts (recommended)

1. AI Gateway daily spend cap in Vercel billing.
2. Agent Runs error rate on flagship project `eve-incident-commander`.
3. Optional: OTEL export via `OTEL_EXPORTER_OTLP_ENDPOINT` (see `agent/instrumentation.ts` on A06).