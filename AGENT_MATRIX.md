# Real-world eve agent matrix

Part of the [unified catalog](AGENT_CATALOG.md) — Layer A (`agents/catalog/01`–`50`).

This rebuild treats eve as a production backend-agent framework, not as a bag of feature demos.
Each archetype below is designed around a real operational workflow, a concrete user, a bounded
data/tool surface, and an evidence requirement.

## Research anchors

- Vercel's eve announcement positions the framework around durable execution, sandboxed compute,
  HITL approvals, subagents, evals, schedules, channels, and secure connections:
  <https://vercel.com/blog/introducing-eve>
- The eve docs and repo define the filesystem contract: `agent.ts`, `instructions.md`, `tools/`,
  `skills/`, `channels/`, `connections/`, `sandbox/`, `schedules/`, `subagents/`, and `evals/`:
  <https://vercel.com/docs/eve>, <https://github.com/vercel/eve>
- Vercel's public examples emphasize real workflows: data analysis, SDR, sales cockpit, support,
  content operations, and routing across an agent fleet:
  <https://vercel.com/blog/introducing-eve>
- Vercel Labs templates inform the implementation shape:
  content agent, personal/memory agent, Slack starter, and PR triage agent.
  <https://github.com/vercel-labs/eve-content-agent-template>,
  <https://github.com/vercel-labs/personal-agent-template>,
  <https://github.com/vercel-labs/eve-slack-agent-template>,
  <https://github.com/vercel-labs/eve-pr-triage-agent-template>
- SuperServe is the remote sandbox target for code, files, and long-running agent work:
  <https://superserve.ai>
- Monid is intended for live external tool discovery/runs. In this workspace, `MONID_API_KEY` is
  present but currently rejected by the API as invalid, so Monid-backed live research must be rerun
  once the key is corrected.

## Agent acceptance bar

Every agent must include:

- A real user and operational job, not just a framework feature.
- `agent/instructions.md` with concrete operating rules.
- At least one deterministic tool or seeded workspace data file.
- A domain skill/playbook under `agent/skills/`.
- A README with run command, sample prompt, expected tools/data, evidence notes, and rough cost notes.
- A captured sample log or deterministic dry-run evidence. Live proof is required when OpenRouter and
  SuperServe keys are available.
- Typecheck coverage through the workspace.

## 50 archetypes

| # | Agent | Real-world job | Primary surfaces |
|---|-------|----------------|------------------|
| 01 | Revenue analyst | Answers KPI/revenue questions from a warehouse extract and explains assumptions. | SQL-style data, sandbox code |
| 02 | Sales lead researcher | Enriches inbound leads, scores fit, and drafts next-best action. | CRM records, live research hook |
| 03 | CRM hygiene auditor | Finds duplicate accounts, stale owners, and missing lifecycle fields. | CRM CSV, report artifact |
| 04 | Support ticket triage | Classifies tickets, finds likely answer paths, and escalates risk. | Ticket queue, KB snippets |
| 05 | Refund approval operator | Applies refund policy and gates side-effecting refunds behind HITL approval. | Policy skill, approval tool |
| 06 | Incident commander | Builds an incident timeline and next-action checklist from alerts/logs. | Alert log, runbook skill |
| 07 | On-call runbook executor | Executes safe diagnostic commands and writes an operator handoff. | Sandbox shell, runbook |
| 08 | Cloud cost optimizer | Finds avoidable spend and proposes low-risk savings actions. | Billing export, approval |
| 09 | Security CVE triager | Maps CVEs to affected services and prioritizes remediation. | SBOM/CVE feed |
| 10 | Dependency upgrade planner | Plans package upgrades with risk, tests, and rollback steps. | package manifests |
| 11 | PR triage reviewer | Summarizes diffs, labels risk, and suggests reviewers. | GitHub-style PR diff |
| 12 | Code review risk assessor | Reviews a patch for correctness, security, and test gaps. | Patch files, checklist |
| 13 | Release notes drafter | Turns merged changes into customer-facing release notes. | Changelog data, style skill |
| 14 | Migration planner | Converts legacy API/code inventory into an execution plan. | Repo inventory |
| 15 | Test failure debugger | Reads failing logs, identifies likely cause, and proposes a fix. | Test logs, sandbox |
| 16 | Documentation QA | Audits docs for broken promises, stale commands, and missing prerequisites. | Docs bundle |
| 17 | Content pipeline agent | Drafts blog/social/newsletter copy from source notes and style rules. | Content brief, style skill |
| 18 | Brand voice reviewer | Lints copy against tone, banned phrases, and evidence requirements. | Copy file, lint tool |
| 19 | Social sentiment monitor | Clusters social posts and reports sentiment/drivers. | Social sample, live hook |
| 20 | Competitor intelligence brief | Produces sourced competitor/product movement summaries. | Research notes, live hook |
| 21 | Market/news briefing | Generates daily sector brief with confidence and source gaps. | News sample, schedule |
| 22 | Finance KPI analyst | Analyzes margin, cash, runway, and anomalies. | Finance CSV |
| 23 | Invoice anomaly auditor | Flags suspicious invoices and missing approvals. | AP export |
| 24 | Procurement vendor comparer | Scores vendors against requirements, risk, and cost. | RFP responses |
| 25 | Contract clause reviewer | Finds risky clauses and drafts review questions. | Contract excerpt, policy |
| 26 | Compliance policy checker | Checks proposed actions against a controls matrix. | Policy matrix |
| 27 | Privacy DSR responder | Builds data-subject request task plan without exposing sensitive data. | DSR case file |
| 28 | HR onboarding assistant | Creates onboarding plans and tracks missing setup tasks. | Employee role profile |
| 29 | Recruiting resume screener | Screens resumes against job criteria with fairness guardrails. | Resume/job bundle |
| 30 | Employee IT helpdesk | Diagnoses access/device issues and drafts escalation packets. | IT ticket queue |
| 31 | Access request approver | Checks access requests against least-privilege policy and requires approval. | IAM request |
| 32 | Knowledge base maintainer | Finds KB gaps from recurring tickets and drafts article updates. | Tickets + KB |
| 33 | RAG support search | Retrieves grounded support answers from a document set. | Local docs |
| 34 | Product feedback synthesizer | Clusters feedback into themes, severity, and roadmap asks. | Feedback export |
| 35 | Roadmap prioritizer | Scores initiatives by impact, confidence, effort, and risk. | Product backlog |
| 36 | Experiment analyst | Reviews A/B results and recommends ship/iterate/stop. | Experiment CSV |
| 37 | ETL data quality monitor | Detects schema drift, null spikes, and late data. | Pipeline metrics |
| 38 | Data catalog steward | Documents datasets, owners, freshness, and PII flags. | Dataset inventory |
| 39 | Code interpreter analyst | Runs ad-hoc Python analysis over uploaded data. | Sandbox workspace |
| 40 | PDF due diligence analyst | Extracts issues and questions from diligence documents. | PDF/text bundle |
| 41 | Insurance claims triage | Prioritizes claims, missing evidence, and fraud indicators. | Claim file |
| 42 | Healthcare intake summarizer | Summarizes intake for staff without diagnosis or treatment advice. | Intake form |
| 43 | Travel operations assistant | Handles itinerary disruption options and traveler comms. | Travel file, weather hook |
| 44 | Logistics exception monitor | Explains delayed shipments and proposes mitigation. | Shipment events |
| 45 | Ecommerce merchandising analyst | Finds assortment/pricing/review issues by SKU. | Catalog export |
| 46 | Inventory replenishment planner | Recommends reorder actions from demand and lead time. | Inventory CSV |
| 47 | Real estate comp analyst | Compares properties and flags valuation caveats. | Comparable sales |
| 48 | Education tutor planner | Builds lesson plans and rubric feedback with safety bounds. | Student profile |
| 49 | Research literature mapper | Clusters papers, claims, methods, and open questions. | Paper abstracts |
| 50 | Agent fleet router | Routes incoming tasks to the right specialized agent and explains why. | Agent registry |

## Evidence plan

- Local deterministic proof: typecheck plus generated dry-run fixtures for each agent.
- Live proof, once keys are available: run representative agents through `scripts/run-catalog-agent.sh`
  with OpenRouter and SuperServe, then store NDJSON logs.
- Monid proof, once key is valid: discover/inspect/run live data endpoints for research-heavy agents
  and log per-call costs.
