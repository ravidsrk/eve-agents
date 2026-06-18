# Verification

Date: 2026-06-18

## Environment observed

- Node: `v24.16.0`
- OpenRouter: live key validated with `openai/gpt-oss-120b`.
- SuperServe: live key validated with the `superserve/python-ml` sandbox.
- Monid: live key validated with discover and inspect calls.

## Commands run

```bash
npm install
npm run verify:catalog
npm test
npm audit --omit=dev
npm run typecheck
bash scripts/run_catalog_live.sh
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

`bash scripts/run_catalog_live.sh`

```text
all 50 archetypes PASS; see VERIFY-LIVE.md
```

## Live proof

Every archetype has a committed `run.log` captured from the eve NDJSON stream. The logs were checked
for:

- `session.waiting` or `session.completed`,
- `load_dossier`,
- `analyze_records`,
- `write_report`.

The run summary is in [VERIFY-LIVE.md](VERIFY-LIVE.md).
