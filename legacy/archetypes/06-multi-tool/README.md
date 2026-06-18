# 06 · Multi-Tool Orchestrator

**Rationale.** Exercises the model's tool-selection and parallel tool-calling over several typed
eve tools (`get_weather`, `convert_currency`, `calculate`) and the synthesis of their results into
one answer. A good target for `toolOrder` / `calledTool` evals.

**Stack.** OpenRouter `openai/gpt-oss-120b` · no sandbox (app-runtime tools).

## Run
```bash
bash run_archetype.sh archetypes/06-multi-tool 3114 "(1) weather in Paris (2) 250 USD to EUR (3) 15% tip on \$80"
```

## Proof (see `run.log`)
In one step the model issued **3 parallel tool calls** — `get_weather(Paris)`,
`convert_currency(250 USD→EUR)`, `calculate(80*0.15)` — and combined the results: *Paris 19 °C,
230 EUR, $12 tip* (all correct).

## Cost notes
~few k tokens, no sandbox. ≈ $0.0005.
