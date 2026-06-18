---
description: Operating playbook for Migration planner. Load when planning, triaging, or writing recommendations.
---

# Migration planner playbook

## User
Engineering

## Job
Converts legacy API/code inventory into an execution plan.

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
Stage migrations by blast radius and rollback availability.

## Tags
migration, planning
