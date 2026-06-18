# 16 · Eval-Driven Self-Checking Agent

**Rationale.** An agent that distrusts a single computation: it solves a problem one way, then
**independently verifies** with a second method in the sandbox, and only answers if both agree.
Pairs with the eval suite in `/evals` (Phase 3).

**Stack.** OpenRouter `openai/gpt-oss-120b` · SuperServe `superserve/python-ml`.

## Run
```bash
bash run_archetype.sh archetypes/16-eval-self 3128 "What is the 20th prime number? Verify independently."
```

## Proof (see `run.log`)
Computed the 20th prime via trial-division (A) and a sieve of Eratosthenes (B); both returned **71**;
answered only after confirming agreement. (It also gracefully fell back when `sympy` wasn't present.)

## Cost notes
~few k tokens; one `python-ml` microVM. ≈ $0.001.
