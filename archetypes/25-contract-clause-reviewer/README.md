# Contract clause reviewer

## Rationale

Contract clause reviewer is a real-world eve archetype for Legal Ops.

Mission: Finds risky clauses and drafts review questions.

This is not a toy feature demo: it has a bounded user, local operational records, a playbook skill,
approval-gated side effects, and report output.

## Run

```bash
bash ../../scripts/run_archetype.sh archetypes/25-contract-clause-reviewer 3225 "Review the current contract clause reviewer queue and write a prioritized action report."
```

Requires:

- `OPENROUTER_API_KEY` for model inference.
- `SUPERSERVE_API_KEY` for sandbox-backed eve file/code execution.
- Optional valid `MONID_API_KEY` for live external research in follow-up work.

## Tools and data

- `load_dossier`: loads `agent/data/dossier.json`.
- `search_records`: searches `agent/data/records.json`.
- `analyze_records`: scores local records for risk and opportunity.
- `write_report`: writes a markdown artifact under `.agent-artifacts/`.
- `record_decision`: approval-gated simulated side effect.
- `fetch_live_json`: guarded HTTPS JSON fetch, disabled unless `ALLOW_EXTERNAL_FETCH=1`.

## Sample prompt

> Review the current contract clause reviewer queue and write a prioritized action report.

## Expected behavior

The agent should load the dossier, inspect records, identify the highest-priority item, state
assumptions and uncertainty, and write a report. For any action that changes an external system, it
must use `record_decision`, which pauses for human approval.

## Evidence status

- Deterministic fixtures: included in `agent/data/`.
- Live OpenRouter/SuperServe run: pending until those keys are available in this workspace.
- Monid live research: pending because the currently available Monid key is rejected by the API.

## Domain rule

This is triage, not legal advice; route final judgment to counsel.

## Tags

legal, contracts
