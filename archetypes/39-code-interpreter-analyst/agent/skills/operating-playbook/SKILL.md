---
description: Operating playbook for Code interpreter analyst. Load when planning, triaging, or writing recommendations.
---

# Code interpreter analyst playbook

## User
Analytics

## Job
Runs ad-hoc Python analysis over uploaded data.

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
Use sandbox code for calculations instead of mental math.

## Tags
python, analysis
