# 05 · SQL Agent (SQLite in a sandbox)

**Rationale.** Natural-language questions answered by actually running SQL, not hallucinating. The
agent builds a SQLite DB from a seeded `schema.sql` and queries it with Python's `sqlite3` inside a
SuperServe microVM. Demonstrates seeded schema + multi-step tool use producing verifiable numbers.

**Stack.** OpenRouter `openai/gpt-oss-120b` · SuperServe `superserve/python-ml`.

## Run
```bash
bash run_archetype.sh archetypes/05-sql-agent 3112 "Total PAID order amount per country?"
```

## Proof (see `run.log`)
Agent wrote a `JOIN ... WHERE status='paid' GROUP BY country` query and returned:
`US 3000.5 · UK 2000.0 · DE 100.0` — verified correct against the seed data (pending/refunded
orders correctly excluded).

## Cost notes
~few k tokens; one `python-ml` microVM. ≈ $0.001.
