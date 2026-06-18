# P06 — SQL analyst

NL → SQL with explain and optimize via Strale Monid endpoints.

| Tool | Endpoint | ~Cost |
|------|----------|-------|
| `generate_sql` | `/x402/sql-generate` | $0.011 |
| `explain_sql` | `/x402/sql-explain` | $0.011 |
| `optimize_sql` | `/x402/sql-optimize` | $0.011 |

```bash
cd agents/production/p06-sql-analyst && npx eve dev --no-ui --port 3306
```