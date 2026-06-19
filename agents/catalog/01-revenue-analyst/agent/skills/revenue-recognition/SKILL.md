---
description: Revenue recognition rules for finance KPI answers. Load before answering revenue questions.
---

# Revenue recognition

## Rules

1. Call `run_aggregate` on `agent/data/revenue.csv` — do not guess totals from memory.
2. Default to `recognizedOnly: true` unless the user asks for booked-but-unrecognized revenue.
3. State assumptions returned by the tool (extract date, recognition filter).
4. Separate recognized vs deferred when APAC Services or similar rows are excluded.

## Typical questions

- Total recognized revenue by region → `run_aggregate({ metric: "sum", groupBy: "region", recognizedOnly: true })`
- Product mix → `groupBy: "product"`