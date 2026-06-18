# Eve Exploration — Unified Agent Catalog

One catalog, four layers. Every agent in this repo is listed here with its role, path, and relationships.

| Layer | Count | Path | Purpose |
| --- | ---: | --- | --- |
| **Reference** | 10 | [`agents/reference/`](agents/reference/) | Ported [vercel/eve](https://github.com/vercel/eve) e2e fixtures — framework primitives with evals |
| **Catalog** | 50 | [`agents/catalog/`](agents/catalog/) | Real-world job templates — dossiers, playbooks, shared tools, live evidence |
| **Production** | 10 | [`agents/production/`](agents/production/) | Monid-integrated deep agents — custom domain tools, live-verified |
| **Integrations** | 22 | [`agents/integrations/`](agents/integrations/) | Integration proofs — HITL, MCP, Slack, durability (selective reuse) |

**Total: 92 agents** (10 + 50 + 10 + 22). Machine-readable index: `npm run catalog:list`.

---

## How the layers relate

```text
                    ┌─────────────────────────────────────┐
                    │        Reference (Layer R)           │
                    │  vercel/eve fixtures + strict evals │
                    └─────────────────┬───────────────────┘
                                      │ port patterns
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────────┐      ┌─────────────────────┐
│ Catalog A01–A50  │      │ Production P01–P10   │      │ Integrations I01–22 │
│ broad coverage   │◄────►│ Monid depth on picks │      │ integration proofs  │
│ agent-kit tools  │ pairs│ custom tools + APIs  │      │ harnesses + fixtures│
└──────────────────┘      └──────────────────────┘      └─────────────────────┘
```

- **Start with reference** when learning eve primitives or running `eve eval --strict`.
- **Browse catalog (A01–A50)** for real-world job coverage and copy-paste starters.
- **Use production (P01–P10)** when you need live Monid tools and domain-specific implementations.
- **Open integrations (I01–I22)** only for harnesses (HITL, durable resume, MCP, Slack, swarm) or fixtures to extract.

Full matrix for A01–A50: [AGENT_MATRIX.md](AGENT_MATRIX.md).

---

## Reference (`agents/reference/`)

Ported via `bash scripts/port-eve-fixture.sh <name>`. Model: OpenRouter (`@lab/openrouter`).

| Agent | Upstream fixture | Pattern | Sandbox |
| --- | --- | --- | --- |
| agent-basic-runtime | `e2e/fixtures/agent-basic-runtime` | Multi-turn, images, output schema | — |
| agent-channels | `e2e/fixtures/agent-channels` | Webhook + cross-channel | — |
| agent-openapi-swagger | `e2e/fixtures/agent-openapi-swagger` | OpenAPI + HITL connections | — |
| agent-schedules | `e2e/fixtures/agent-schedules` | Cron schedules | — |
| agent-skills | `e2e/fixtures/agent-skills` | Dynamic skills | — |
| agent-subagents | `e2e/fixtures/agent-subagents` | Declared subagents | — |
| agent-subagents-hitl | `e2e/fixtures/agent-subagents-hitl` | Subagent + approval | — |
| agent-tools | `e2e/fixtures/agent-tools` | Multi-step tool loops | — |
| agent-tools-hitl | `e2e/fixtures/agent-tools-hitl` | Approval gates | — |
| agent-tools-sandbox | `e2e/fixtures/agent-tools-sandbox` | Code execution + network policy | SuperServe `python-ml` |

```bash
npm run validate:official          # all fixtures
cd agents/reference/agent-tools && npx eve eval --strict
```

---

## Catalog (`agents/catalog/01`–`50`)

Generated from [AGENT_MATRIX.md](AGENT_MATRIX.md). Each agent has `agent/`, instructions, playbook skill, dossier + records, SuperServe sandbox, README, dry-run evidence, and a captured live `run.log`.

Shared tools via `@lab/agent-kit`: `load_dossier`, `search_records`, `analyze_records`, `write_report`, `record_decision`, `fetch_live_json`.

| # | Agent | Job |
| ---: | --- | --- |
| 01 | [revenue-analyst](agents/catalog/01-revenue-analyst) | KPI/revenue Q&A from warehouse extract |
| 02 | [sales-lead-researcher](agents/catalog/02-sales-lead-researcher) | Lead enrichment and next-best action |
| 03 | [crm-hygiene-auditor](agents/catalog/03-crm-hygiene-auditor) | Duplicate accounts, stale owners |
| 04 | [support-ticket-triage](agents/catalog/04-support-ticket-triage) | Classify tickets, escalate risk |
| 05 | [refund-approval-operator](agents/catalog/05-refund-approval-operator) | Refund policy + HITL approval |
| 06 | [incident-commander](agents/catalog/06-incident-commander) | Incident timeline + next actions |
| 07 | [oncall-runbook-executor](agents/catalog/07-oncall-runbook-executor) | Safe diagnostics + handoff |
| 08 | [cloud-cost-optimizer](agents/catalog/08-cloud-cost-optimizer) | Spend reduction proposals |
| 09 | [security-cve-triager](agents/catalog/09-security-cve-triager) | CVE → service mapping |
| 10 | [dependency-upgrade-planner](agents/catalog/10-dependency-upgrade-planner) | Upgrade risk + rollback plan |
| 11 | [pr-triage-reviewer](agents/catalog/11-pr-triage-reviewer) | Diff summary, risk labels |
| 12 | [code-review-risk-assessor](agents/catalog/12-code-review-risk-assessor) | Patch review checklist |
| 13 | [release-notes-drafter](agents/catalog/13-release-notes-drafter) | Customer-facing release notes |
| 14 | [migration-planner](agents/catalog/14-migration-planner) | Legacy → target migration plan |
| 15 | [test-failure-debugger](agents/catalog/15-test-failure-debugger) | Failing log → root cause |
| 16 | [documentation-qa](agents/catalog/16-documentation-qa) | Docs accuracy audit |
| 17 | [content-pipeline-agent](agents/catalog/17-content-pipeline-agent) | Blog/social/newsletter drafts |
| 18 | [brand-voice-reviewer](agents/catalog/18-brand-voice-reviewer) | Tone and evidence lint |
| 19 | [social-sentiment-monitor](agents/catalog/19-social-sentiment-monitor) | Sentiment clustering |
| 20 | [competitor-intelligence-brief](agents/catalog/20-competitor-intelligence-brief) | Competitor movement summary |
| 21 | [market-news-briefing](agents/catalog/21-market-news-briefing) | Daily sector brief |
| 22 | [finance-kpi-analyst](agents/catalog/22-finance-kpi-analyst) | Margin, runway, anomalies |
| 23 | [invoice-anomaly-auditor](agents/catalog/23-invoice-anomaly-auditor) | Suspicious invoice flags |
| 24 | [procurement-vendor-comparer](agents/catalog/24-procurement-vendor-comparer) | Vendor scoring |
| 25 | [contract-clause-reviewer](agents/catalog/25-contract-clause-reviewer) | Risky clause review |
| 26 | [compliance-policy-checker](agents/catalog/26-compliance-policy-checker) | Controls matrix check |
| 27 | [privacy-dsr-responder](agents/catalog/27-privacy-dsr-responder) | Data-subject request plan |
| 28 | [hr-onboarding-assistant](agents/catalog/28-hr-onboarding-assistant) | Onboarding task plan |
| 29 | [recruiting-resume-screener](agents/catalog/29-recruiting-resume-screener) | Fair resume screening |
| 30 | [employee-it-helpdesk](agents/catalog/30-employee-it-helpdesk) | Access/device triage |
| 31 | [access-request-approver](agents/catalog/31-access-request-approver) | Least-privilege approval |
| 32 | [knowledge-base-maintainer](agents/catalog/32-knowledge-base-maintainer) | KB gap detection |
| 33 | [rag-support-search](agents/catalog/33-rag-support-search) | Grounded support answers |
| 34 | [product-feedback-synthesizer](agents/catalog/34-product-feedback-synthesizer) | Feedback themes |
| 35 | [roadmap-prioritizer](agents/catalog/35-roadmap-prioritizer) | Initiative scoring |
| 36 | [experiment-analyst](agents/catalog/36-experiment-analyst) | A/B ship/iterate/stop |
| 37 | [etl-data-quality-monitor](agents/catalog/37-etl-data-quality-monitor) | Schema drift, null spikes |
| 38 | [data-catalog-steward](agents/catalog/38-data-catalog-steward) | Dataset inventory |
| 39 | [code-interpreter-analyst](agents/catalog/39-code-interpreter-analyst) | Ad-hoc Python analysis |
| 40 | [pdf-due-diligence-analyst](agents/catalog/40-pdf-due-diligence-analyst) | PDF diligence Q&A |
| 41 | [insurance-claims-triage](agents/catalog/41-insurance-claims-triage) | Claim prioritization |
| 42 | [healthcare-intake-summarizer](agents/catalog/42-healthcare-intake-summarizer) | Intake summary (no diagnosis) |
| 43 | [travel-operations-assistant](agents/catalog/43-travel-operations-assistant) | Itinerary disruption |
| 44 | [logistics-exception-monitor](agents/catalog/44-logistics-exception-monitor) | Shipment delay mitigation |
| 45 | [ecommerce-merchandising-analyst](agents/catalog/45-ecommerce-merchandising-analyst) | SKU assortment issues |
| 46 | [inventory-replenishment-planner](agents/catalog/46-inventory-replenishment-planner) | Reorder recommendations |
| 47 | [real-estate-comp-analyst](agents/catalog/47-real-estate-comp-analyst) | Property valuation comps |
| 48 | [education-tutor-planner](agents/catalog/48-education-tutor-planner) | Lesson plans + rubric |
| 49 | [research-literature-mapper](agents/catalog/49-research-literature-mapper) | Paper clustering |
| 50 | [agent-fleet-router](agents/catalog/50-agent-fleet-router) | Task → specialist routing |

```bash
npm run verify:catalog
bash scripts/run-catalog-agent.sh agents/catalog/06-incident-commander 3206 "Load dossier, analyze records, write report."
bash scripts/run_catalog_live.sh   # all 50 sequentially → VERIFY-LIVE.md
```

Live evidence: [VERIFY-LIVE.md](VERIFY-LIVE.md) (50/50 PASS).

---

## Production (`agents/production/p01`–`p10`)

Monid-backed agents with custom tools. Each pairs with one or more catalog agents (Layer A) but goes deeper on external APIs.

| ID | Agent | Catalog peers | Monid / external |
| --- | --- | --- | --- |
| P01 | [incident-triage](agents/production/p01-incident-triage) | A06 | `log-parse`, `error-explain` |
| P02 | [pr-review](agents/production/p02-pr-review) | A11, A12 | `code-review`, `github-repo-analyze` |
| P03 | [competitive-intel](agents/production/p03-competitive-intel) | A20, A21 | `exa/search`, `exa/answer` |
| P04 | [invoice-extractor](agents/production/p04-invoice-extractor) | A23, A40 | `invoice-extract`, `pdf-extract` |
| P05 | [support-router](agents/production/p05-support-router) | A04, A33 | `exa/search`, `exa/answer` |
| P06 | [sql-analyst](agents/production/p06-sql-analyst) | A01, A22 | `sql-generate`, `sql-explain` |
| P07 | [runbook-executor](agents/production/p07-runbook-executor) | A07 | runbook workspace + `log-parse` |
| P08 | [lead-enricher](agents/production/p08-lead-enricher) | A02 | PDL company/person enrich |
| P09 | [contract-checker](agents/production/p09-contract-checker) | A25, A26 | `contract-extract` |
| P10 | [pipeline-debugger](agents/production/p10-pipeline-debugger) | A15, A37 | `log-parse`, `error-explain` |

```bash
npm run smoke:production        # Monid smoke P01–P03
npm run run:production:all      # live batch all 10
bash scripts/run-production-agent.sh agents/production/p01-incident-triage 3301 "Triage this incident log."
```

---

## Integrations (`agents/integrations/`)

v1 builds that proved OpenRouter + SuperServe + Monid wiring. **Do not extend.** Use this table to decide what to keep, extract, or ignore.

| ID | Agent | Eve primitive | Superseded by | Reusable assets | Action |
| ---: | --- | --- | --- | --- | --- |
| L01 | data-analyst | Sandbox + pandas on seed CSV | A01, A39 | `sales.csv` seed | **Keep** — minimal sandbox smoke |
| L02 | web-research | Monid HTTP discover/inspect/run | A02, A20; P03, P08 | Monid playbook in instructions | **Extract** → `@lab/monid-tools` docs |
| L03 | coding-refactor | Sandbox file edit until tests pass | A15; official agent-tools-sandbox | broken `math.js` fixture | Deprecate |
| L04 | pdf-qa | Binary PDF in sandbox | A40; P04 | `report.pdf` seed | **Extract** → A40 or shared fixtures |
| L05 | sql-agent | SQLite in sandbox | P06 | `schema.sql` seed | **Extract** → P06 eval fixture |
| L06 | multi-tool | Parallel stub tools | official agent-tools | `evals/orchestration.eval.ts` | **Extract** eval → official |
| L07 | subagents | Coordinator + specialists | official agent-subagents | subagent layout | Deprecate |
| L08 | hitl | `needsApproval` refund tool | official agent-tools-hitl; A05 | `refund_charge.ts`; `npm run test:hitl` | **Keep** — HITL harness |
| L09 | cron | `defineSchedule` | official agent-schedules | heartbeat schedule | Deprecate |
| L10 | slack | Slack channel + Connect | A04, A30; official agent-channels | `channels/slack.ts` | **Keep** — only Slack demo |
| L11 | durable-resume | Kill process, resume session | *unique* | pause/reconnect sandbox; `npm run test:durable` | **Keep** — durability proof |
| L12 | mcp | Monid MCP connection | *unique* | `connections/monid.ts` | **Keep** — only MCP demo |
| L13 | openapi | Inline OpenAPI spec (Frankfurter) | official agent-openapi-swagger | `connections/fx.ts` | **Extract** → official docs |
| L14 | codebase | `git clone` in sandbox | A12; P02 | clone-in-sandbox playbook | Extract to docs |
| L15 | etl | Fetch → transform → artifact | A37; P10 | Frankfurter ETL workflow | Deprecate |
| L16 | eval-self | Dual sandbox methods must agree | *unique* | verification instructions | **Keep** — eval pattern |
| L17 | sentiment | Monid fetch + classify | A19; P03 | sentiment workflow | Deprecate |
| L18 | rag | TF-IDF over seeded kb/*.txt | A33 | `kb/*.txt` corpus | **Extract** → A33 fixtures |
| L19 | web-ui | NDJSON streaming chat UI | *unique* | `web/serve.mjs`, `index.html` | **Keep** — local dev UI |
| L20 | swarm | N parallel SuperServe VMs | *unique* | `swarm_run.ts` | **Keep** — extract to agent-kit |
| L21 | skills | `load_skill` refund policy | official agent-skills; A05 | refund_policy.md | Deprecate |
| L22 | security | `networkPolicy: deny-all` | official agent-tools-sandbox | egress timeout proof | **Keep** — robustness suite |

### Legacy assets worth extracting (priority)

1. **`integrations/20-swarm/agent/tools/swarm_run.ts`** → `@lab/agent-kit` (parallel VM fan-out)
2. **`integrations/06-multi-tool/evals/orchestration.eval.ts`** → `reference/agent-tools/evals/`
3. **Seed fixtures** — I04 PDF, I05 schema.sql, I18 kb/*.txt, I01 sales.csv → deepen matching catalog/production agents
4. **`integrations/19-web-ui/web/`** → future `apps/templates/web-chat` or docs section
5. **Harness agents I08, I11, I22** — keep until tests are repointed at reference equivalents

---

## Packages (shared integrations)

| Package | Role |
| --- | --- |
| [`@lab/openrouter`](packages/openrouter/) | OpenRouter LanguageModel for eve (lazy env auth) |
| [`@lab/superserve-backend`](packages/superserve-backend/) | SuperServe SandboxBackend |
| [`@lab/monid-tools`](packages/monid-tools/) | Monid HTTP tools + budget guard |
| [`@lab/agent-kit`](packages/agent-kit/) | Deterministic tools for catalog agents A01–A50 |

---

## Setup and validation (all layers)

```bash
# 1. Keys in .secrets/eve.env, then:
bash scripts/setup.sh

# 2. Structural checks
npm run verify:catalog
npm run catalog:list

# 3. Live runs (need OpenRouter + SuperServe keys)
bash scripts/run-catalog-agent.sh agents/catalog/01-revenue-analyst 3201 "Write a prioritized report."
npm run run:production:all
npm run validate:official

# 4. Integration proofs (legacy harnesses)
npm run test:hitl
npm run test:durable
npm run test:robustness
```

---

## Directory layout

```text
agents/
  catalog/            # 50 real-world job templates
  reference/          # 10 vercel/eve fixtures
  production/         # 10 Monid deep agents
  integrations/       # 22 integration proofs
lab/                  # Minimal eve lab app
packages/             # @lab/openrouter, superserve-backend, monid-tools, agent-kit
scripts/              # setup, runners, catalog:list
```

---

## Next steps

1. **Deepen 10 catalog picks** — add domain-specific tools to high-value A* agents ([FINDINGS.md](FINDINGS.md) list).
2. **Extract legacy fixtures** — PDF, SQL schema, RAG corpus into matching A40, P06, A33.
3. **Extract `swarm_run`** — promote L20 parallel sandbox tool to `@lab/agent-kit`.
4. **Add evals** to top catalog agents; official fixtures already have eval coverage.
5. **Channels** — port L10 Slack patterns into A04, A17, A30, A50.