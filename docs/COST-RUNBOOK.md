# Cost runbook

Where money is spent and how caps are enforced.

## Vercel / AI Gateway (deployed catalog)

| Item | Detail |
| --- | --- |
| **Model** | `openai/gpt-5.4-mini` via `resolveModel()` on Vercel |
| **Dashboard** | Vercel → Observability → Agent Runs |
| **Flagship smoke** | ~5 evals, sub-minute; expect cents per full `eval:flagship` on mini |
| **Rate limits** | Free Gateway tier may throttle deployed evals — lab evals are the CI fallback |

Set a daily spend alert in Vercel billing for project `eve-incident-commander`.

## Lab track (OpenRouter + SuperServe)

| Key | Used for |
| --- | --- |
| `OPENROUTER_API_KEY` | All local `eve dev` and `eve eval` |
| `SUPERSERVE_API_KEY` | Sandbox-backed agents locally |

SuperServe has a **team sandbox quota** (~30). Before long eval batches:

```bash
npm run cleanup:superserve
```

Ephemeral runners set `EVE_KILL_SANDBOX_ON_DISPOSE=1` to kill VMs after single-shot runs.

## Monid (production agents only)

Catalog agents do **not** call Monid. Production p01–p10 use `@eve-catalog/monid-tools`.

| Env | Default | Meaning |
| --- | --- | --- |
| `MONID_BUDGET_USD` | `5` | Max spend per Node process |
| `MONID_MAX_CALL_USD` | `0.25` | Max single `run()` charge |
| `MONID_COST_LOG` | `<tmpdir>/monid-costs.jsonl` | Append-only ledger |

`run()` refuses calls that would exceed caps and serializes concurrent requests.

## Recommended alerts

1. Vercel AI Gateway daily cap on flagship project
2. Agent Runs error rate spike after deploy
3. Monid wallet balance (if using production agents in production)
4. Optional OTEL: `OTEL_EXPORTER_OTLP_ENDPOINT` on A06 `instrumentation.ts`

## Related

- [SECURITY.md](./SECURITY.md) — no keys on Vercel for inference
- [DEPLOY.md](./DEPLOY.md) — prebuilt deploy path