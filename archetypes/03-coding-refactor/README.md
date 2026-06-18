# 03 · Coding / Refactor (fix failing tests in a sandbox)

**Rationale.** A coding agent that edits real source and runs the test suite in an isolated VM
until it passes — the core "agent writes & verifies code" loop. Uses eve's default `read_file` /
`write_file` / `bash` tools against a SuperServe `node-22` microVM.

**Stack.** OpenRouter `openai/gpt-oss-120b` · SuperServe `superserve/node-22` (Node 22).

## Run
```bash
bash run_archetype.sh archetypes/03-coding-refactor 3111 "Run node test.js; fix src/math.js so all tests pass."
```

## Proof (see `run.log`)
`node test.js` failed (`factorial(0) should be 1 — 0 !== 1`). Agent read `src/math.js`, changed the
accumulator `let result = 0` → `1`, re-ran → `ALL TESTS PASSED` (exitCode 0). Reported the diff.

## Failures hit + fixes
- ESM imports require `"type":"module"`; added a seed `package.json`. The model converged in 2 edit
  iterations (wrote, re-read, fixed) — gpt-oss-120b self-corrects from the assertion message.

## Cost notes
~few k tokens; one `node-22` microVM, paused on idle. ≈ $0.001.
