---
description: Operating playbook for Procurement vendor comparer. Load when planning, triaging, or writing recommendations.
---

# Procurement vendor comparer playbook

## User
Procurement

## Job
Scores vendors against requirements, risk, and cost.

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
Separate hard requirements from weighted preferences.

## Tags
procurement, vendor
