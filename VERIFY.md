# Verification

Date: 2026-06-18

## Environment observed

- Node: `v24.16.0`
- `OPENROUTER_API_KEY`: missing
- `SUPERSERVE_API_KEY`: missing
- `MONID_API_KEY`: present but rejected by Monid API as invalid

## Commands run

```bash
npm install
npm run verify:catalog
npm test
npm audit --omit=dev
npm run typecheck
```

## Results

`npm install`

```text
added 201 packages, removed 22 packages, and audited 432 packages
found 0 vulnerabilities
```

`npm run verify:catalog`

```text
PASS: verified 50 real-world eve archetypes
```

`npm test`

```text
RESULT: PASS (4 passed, 0 failed)
```

`npm audit --omit=dev`

```text
found 0 vulnerabilities
```

`npm run typecheck`

```text
typecheck passed for eve-lab and arch-01 through arch-50
```

## Live runs not performed

The rebuild did not claim live NDJSON run logs for the 50 agents because the required keys are not
available in this workspace:

- OpenRouter inference requires `OPENROUTER_API_KEY`.
- SuperServe sandbox execution requires `SUPERSERVE_API_KEY`.
- Monid discover/inspect/run requires a valid `MONID_API_KEY`; the current key returned
  `401 Invalid API key`.

After keys are available, run:

```bash
bash scripts/run_archetype.sh archetypes/01-revenue-analyst 3201 \
  "Review the current revenue analyst queue and write a prioritized action report."
```

Then repeat for representative agents and commit captured `run.log` files only after confirming the
stream contains the expected tool calls and final answer.
