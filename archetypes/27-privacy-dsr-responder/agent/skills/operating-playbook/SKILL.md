---
description: Operating playbook for Privacy DSR responder. Load when planning, triaging, or writing recommendations.
---

# Privacy DSR responder playbook

## User
Privacy

## Job
Builds data-subject request task plans without exposing sensitive data.

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
Minimize personal data and use placeholders in reports.

## Tags
privacy, dsr
