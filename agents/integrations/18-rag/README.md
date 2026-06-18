# 18 · RAG Agent (TF-IDF retrieval over a local KB)

**Rationale.** Retrieval-Augmented Generation without an external embedding API: a small knowledge
base (`agent/sandbox/workspace/kb/*.txt`) is seeded into the sandbox; the agent builds a TF-IDF
index with scikit-learn, retrieves the top passages for the question, and answers only from them
(with source citation). Deterministic and offline.

**Stack.** OpenRouter `openai/gpt-oss-120b` · SuperServe `superserve/python-ml` (scikit-learn).

## Run
```bash
bash ../../scripts/run-catalog-agent.sh agents/integrations/18-rag 3126 "What gas do plants take in during photosynthesis and what do they release?"
```

## Proof (see `run.log`)
TF-IDF retrieval ranked `photosynthesis.txt` top among {mars, eiffel, tcp, photosynthesis}; the
agent answered **CO₂ in, O₂ released** and cited `photosynthesis.txt`.

## Cost notes
~few k tokens; one `python-ml` microVM. ≈ $0.001.
