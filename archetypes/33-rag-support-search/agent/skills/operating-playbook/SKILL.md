---
description: Operating playbook for RAG support search. Load when planning, triaging, or writing recommendations.
---

# RAG support search playbook

## User
Support

## Job
Retrieves grounded support answers from a document set.

## Default workflow

1. Load the dossier and identify the request type.
2. Inspect the relevant records; do not rely on memory.
3. Rank work by user impact, financial impact, security/compliance risk, and reversibility.
4. Produce an answer with:
   - decision or recommendation,
   - evidence,
   - assumptions,
   - risks,
   - next action owner,
   - validation or follow-up command.
5. For side effects, ask for approval through `record_decision`.

## Domain-specific rule
Quote document titles/ids and say when the answer is not in the corpus.

## Tags
rag, support
