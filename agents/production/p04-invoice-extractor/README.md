# P04 — Invoice extractor

Structured extraction from invoice/receipt images and PDFs.

| Tool | Endpoint | ~Cost |
|------|----------|-------|
| `extract_invoice` | `/x402/invoice-extract` | $0.011 |
| `extract_pdf` | `/x402/pdf-extract` | $0.033 |

```bash
cd agents/production/p04-invoice-extractor && npx eve dev --no-ui --port 3304
```