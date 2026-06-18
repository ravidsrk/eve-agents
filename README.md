# eve-exploration

A real-world catalog of 50 Vercel eve agents wired for OpenRouter inference, SuperServe sandbox
execution, and optional Monid-powered live tool research.

This repo is a rebuild of the original toy catalog. The goal is no longer "show one eve feature per
folder." The goal is a practical operating manual for building useful durable backend agents: finance,
support, engineering, security, legal, data, logistics, healthcare operations, education, and more.

## Current status

- 50 archetypes generated from [AGENT_MATRIX.md](AGENT_MATRIX.md).
- Each archetype has an eve `agent/` directory, instructions, tools, a skill/playbook, local records,
  SuperServe sandbox config, README, and deterministic dry-run evidence.
- Local validation passes: catalog verifier, typecheck across all workspaces, Monid budget test, and
  production dependency audit.
- Live OpenRouter/SuperServe runs are pending because this workspace does not currently have
  `OPENROUTER_API_KEY` or `SUPERSERVE_API_KEY`.
- Monid live discovery is pending because the available `MONID_API_KEY` is rejected by the API as
  invalid.

## Architecture

```text
packages/
  openrouter/            OpenRouter LanguageModel provider for eve
  superserve-backend/    Custom eve SandboxBackend for SuperServe microVMs
  monid-tools/           Monid HTTP tools and cost guard
  agent-kit/             Shared deterministic tools for the 50 archetypes
eve-lab/                 Canonical minimal eve lab app
archetypes/01..50/       Real-world eve agents
scripts/
  generate-real-world-archetypes.mjs
  verify-real-world-archetypes.mjs
```

## Setup

```bash
export OPENROUTER_API_KEY=...
export SUPERSERVE_API_KEY=...
export MONID_API_KEY=...
npm install
npm run verify:catalog
npm run typecheck
```

Run one archetype:

```bash
bash scripts/run_archetype.sh archetypes/01-revenue-analyst 3201 \
  "Review the current revenue analyst queue and write a prioritized action report."
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run generate:archetypes` | Regenerate the 50 archetypes from the structured generator. |
| `npm run verify:catalog` | Check every archetype has required files, package names, records, and dry-run evidence. |
| `npm run typecheck` | Typecheck `eve-lab` and every archetype workspace. |
| `npm test` | Run the local Monid budget-cap robustness test. |
| `npm audit --omit=dev` | Check production dependency advisories. |
| `bash scripts/run_archetype.sh <dir> <port> "<prompt>"` | Start an eve dev server, create a session, and capture the stream. |

## The 50 agents

| # | Agent | Real-world job |
| --- | --- | --- |
| 01 | [Revenue analyst](archetypes/01-revenue-analyst) | Answers KPI/revenue questions from a warehouse extract and explains assumptions. |
| 02 | [Sales lead researcher](archetypes/02-sales-lead-researcher) | Enriches inbound leads, scores fit, and drafts next-best action. |
| 03 | [CRM hygiene auditor](archetypes/03-crm-hygiene-auditor) | Finds duplicate accounts, stale owners, and missing lifecycle fields. |
| 04 | [Support ticket triage](archetypes/04-support-ticket-triage) | Classifies tickets, finds likely answer paths, and escalates risk. |
| 05 | [Refund approval operator](archetypes/05-refund-approval-operator) | Applies refund policy and gates side-effecting refunds behind HITL approval. |
| 06 | [Incident commander](archetypes/06-incident-commander) | Builds an incident timeline and next-action checklist from alerts/logs. |
| 07 | [On-call runbook executor](archetypes/07-oncall-runbook-executor) | Executes safe diagnostics and writes an operator handoff. |
| 08 | [Cloud cost optimizer](archetypes/08-cloud-cost-optimizer) | Finds avoidable spend and proposes low-risk savings actions. |
| 09 | [Security CVE triager](archetypes/09-security-cve-triager) | Maps CVEs to affected services and prioritizes remediation. |
| 10 | [Dependency upgrade planner](archetypes/10-dependency-upgrade-planner) | Plans package upgrades with risk, tests, and rollback steps. |
| 11 | [PR triage reviewer](archetypes/11-pr-triage-reviewer) | Summarizes diffs, labels risk, and suggests reviewers. |
| 12 | [Code review risk assessor](archetypes/12-code-review-risk-assessor) | Reviews a patch for correctness, security, and test gaps. |
| 13 | [Release notes drafter](archetypes/13-release-notes-drafter) | Turns merged changes into customer-facing release notes. |
| 14 | [Migration planner](archetypes/14-migration-planner) | Converts legacy API/code inventory into an execution plan. |
| 15 | [Test failure debugger](archetypes/15-test-failure-debugger) | Reads failing logs, identifies likely cause, and proposes a fix. |
| 16 | [Documentation QA](archetypes/16-documentation-qa) | Audits docs for broken promises, stale commands, and missing prerequisites. |
| 17 | [Content pipeline agent](archetypes/17-content-pipeline-agent) | Drafts blog/social/newsletter copy from source notes and style rules. |
| 18 | [Brand voice reviewer](archetypes/18-brand-voice-reviewer) | Lints copy against tone, banned phrases, and evidence requirements. |
| 19 | [Social sentiment monitor](archetypes/19-social-sentiment-monitor) | Clusters social posts and reports sentiment/drivers. |
| 20 | [Competitor intelligence brief](archetypes/20-competitor-intelligence-brief) | Produces sourced competitor/product movement summaries. |
| 21 | [Market/news briefing](archetypes/21-market-news-briefing) | Generates daily sector brief with confidence and source gaps. |
| 22 | [Finance KPI analyst](archetypes/22-finance-kpi-analyst) | Analyzes margin, cash, runway, and anomalies. |
| 23 | [Invoice anomaly auditor](archetypes/23-invoice-anomaly-auditor) | Flags suspicious invoices and missing approvals. |
| 24 | [Procurement vendor comparer](archetypes/24-procurement-vendor-comparer) | Scores vendors against requirements, risk, and cost. |
| 25 | [Contract clause reviewer](archetypes/25-contract-clause-reviewer) | Finds risky clauses and drafts review questions. |
| 26 | [Compliance policy checker](archetypes/26-compliance-policy-checker) | Checks proposed actions against a controls matrix. |
| 27 | [Privacy DSR responder](archetypes/27-privacy-dsr-responder) | Builds data-subject request task plans without exposing sensitive data. |
| 28 | [HR onboarding assistant](archetypes/28-hr-onboarding-assistant) | Creates onboarding plans and tracks missing setup tasks. |
| 29 | [Recruiting resume screener](archetypes/29-recruiting-resume-screener) | Screens resumes against job criteria with fairness guardrails. |
| 30 | [Employee IT helpdesk](archetypes/30-employee-it-helpdesk) | Diagnoses access/device issues and drafts escalation packets. |
| 31 | [Access request approver](archetypes/31-access-request-approver) | Checks access requests against least-privilege policy and requires approval. |
| 32 | [Knowledge base maintainer](archetypes/32-knowledge-base-maintainer) | Finds KB gaps from recurring tickets and drafts article updates. |
| 33 | [RAG support search](archetypes/33-rag-support-search) | Retrieves grounded support answers from a document set. |
| 34 | [Product feedback synthesizer](archetypes/34-product-feedback-synthesizer) | Clusters feedback into themes, severity, and roadmap asks. |
| 35 | [Roadmap prioritizer](archetypes/35-roadmap-prioritizer) | Scores initiatives by impact, confidence, effort, and risk. |
| 36 | [Experiment analyst](archetypes/36-experiment-analyst) | Reviews A/B results and recommends ship/iterate/stop. |
| 37 | [ETL data quality monitor](archetypes/37-etl-data-quality-monitor) | Detects schema drift, null spikes, and late data. |
| 38 | [Data catalog steward](archetypes/38-data-catalog-steward) | Documents datasets, owners, freshness, and PII flags. |
| 39 | [Code interpreter analyst](archetypes/39-code-interpreter-analyst) | Runs ad-hoc Python analysis over uploaded data. |
| 40 | [PDF due diligence analyst](archetypes/40-pdf-due-diligence-analyst) | Extracts issues and questions from diligence documents. |
| 41 | [Insurance claims triage](archetypes/41-insurance-claims-triage) | Prioritizes claims, missing evidence, and fraud indicators. |
| 42 | [Healthcare intake summarizer](archetypes/42-healthcare-intake-summarizer) | Summarizes intake for staff without diagnosis or treatment advice. |
| 43 | [Travel operations assistant](archetypes/43-travel-operations-assistant) | Handles itinerary disruption options and traveler comms. |
| 44 | [Logistics exception monitor](archetypes/44-logistics-exception-monitor) | Explains delayed shipments and proposes mitigation. |
| 45 | [Ecommerce merchandising analyst](archetypes/45-ecommerce-merchandising-analyst) | Finds assortment/pricing/review issues by SKU. |
| 46 | [Inventory replenishment planner](archetypes/46-inventory-replenishment-planner) | Recommends reorder actions from demand and lead time. |
| 47 | [Real estate comp analyst](archetypes/47-real-estate-comp-analyst) | Compares properties and flags valuation caveats. |
| 48 | [Education tutor planner](archetypes/48-education-tutor-planner) | Builds lesson plans and rubric feedback with safety bounds. |
| 49 | [Research literature mapper](archetypes/49-research-literature-mapper) | Clusters papers, claims, methods, and open questions. |
| 50 | [Agent fleet router](archetypes/50-agent-fleet-router) | Routes incoming tasks to the right specialized agent and explains why. |

## Shared tool contract

Every archetype exposes:

- `load_dossier` for local context and integration notes.
- `search_records` for evidence lookup.
- `analyze_records` for deterministic priority scoring.
- `write_report` for durable markdown artifacts.
- `record_decision` for approval-gated simulated side effects.
- `fetch_live_json` for opt-in HTTPS JSON fetches when `ALLOW_EXTERNAL_FETCH=1`.

## Research and findings

- [RESEARCH.md](RESEARCH.md) records current eve, template, SuperServe, OpenRouter, and Monid findings.
- [FINDINGS.md](FINDINGS.md) explains what is now strong, what remains incomplete, and what requires live keys.
- [VERIFY.md](VERIFY.md) records the validation commands and current live-test blockers.
