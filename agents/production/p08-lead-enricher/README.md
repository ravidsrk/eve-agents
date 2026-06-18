# P08 — Lead enricher

CRM lead enrichment via People Data Labs (Monid).

| Tool | Endpoint | ~Cost |
|------|----------|-------|
| `enrich_company` | pdl `/v5/company/enrich` | $0.10 |
| `enrich_person` | pdl `/v5/person/enrich` | $0.30 |

```bash
cd agents/production/p08-lead-enricher && npx eve dev --no-ui --port 3308
```