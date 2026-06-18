# 20 · Swarm (fan out N agents across N SuperServe sandboxes)

**Rationale.** The scale-out angle: run N independent jobs concurrently, each in its **own** isolated
SuperServe Firecracker microVM. The `swarm_run` tool creates N sandboxes in parallel via
`@superserve/sdk`, runs a Python snippet in each, collects results, and kills the VMs — demonstrating
true horizontal fan-out on real infrastructure.

**Stack.** OpenRouter `openai/gpt-oss-120b` · N× SuperServe `superserve/python-ml` (parallel).

## Run
```bash
bash run_archetype.sh archetypes/20-swarm 3129 "Run in separate sandboxes: (a) 12! (b) sum of primes <100 (c) 25th Fibonacci."
```

## Proof (see `run.log`)
`swarm_run` spun up **3 distinct sandboxes** (ids `f8a768cd…`, `eacb5358…`, …) in parallel
(`elapsedMs: 1212`) and returned: **12! = 479,001,600**, **sum primes<100 = 1,060**,
**F₂₅ = 75,025** — all correct. Each job carried its own `sandboxId`.

## Cost notes
N short-lived microVMs (killed after collection). 3 VMs ≈ a few seconds of compute. ≈ $0.001 tokens.
