# 04 · PDF / Document Q&A

**Rationale.** Answer questions grounded in a real PDF. A 1.6 KB PDF (generated via reportlab) is
seeded into the sandbox; the agent extracts text with `pypdf` (installing it at runtime if needed)
and answers with quoted figures. Proves (a) **binary** seed files round-trip through the SuperServe
backend and (b) runtime `pip install` works (network allow-all).

**Stack.** OpenRouter `openai/gpt-oss-120b` · SuperServe `superserve/python-ml`.

## Run
```bash
bash run_archetype.sh archetypes/04-pdf-qa 3113 "What was revenue and YoY growth? Which region contributed most?"
```

## Proof (see `run.log`)
Extracted PDF text and answered: **Revenue 4.2M USD, +18% YoY, North America 64%** — quoting the
document verbatim.

## Cost notes
~few k tokens; one `python-ml` microVM + a one-off `pip install pypdf`. ≈ $0.001.
