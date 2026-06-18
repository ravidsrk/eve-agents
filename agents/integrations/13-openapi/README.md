# 13 · OpenAPI-Connection Agent

**Rationale.** Turn any OpenAPI document into model-callable tools with `defineOpenAPIConnection`.
Here an **inline** OpenAPI 3 spec wraps the live Frankfurter FX API (no auth). Each operation becomes
`connection__fx__<operationId>`, discoverable via the built-in `connection__search`.

**Stack.** OpenRouter `openai/gpt-oss-120b` · Frankfurter FX API · no sandbox.

## Run
```bash
bash ../../scripts/run-catalog-agent.sh agents/integrations/13-openapi 3121 "Latest USD to EUR, GBP, JPY rates? Use the fx connection."
```

## Proof (see `run.log`)
`connection__search` surfaced `getLatestRates`; `connection__fx__getLatestRates` returned `200` with
live data: **USD→EUR 0.86274, GBP 0.74595, JPY 160.31 (date 2026-06-17)**, which the agent reported.

## Failures hit + fixes
- First used the public Swagger Petstore demo, but it returned `500`s. Switched to an inline spec for
  the reliable Frankfurter API — the eve OpenAPI connection (discovery + real HTTP calls) worked in
  both cases; only the upstream demo server was flaky.

## Cost notes
~few k tokens, no sandbox. ≈ $0.0005.
