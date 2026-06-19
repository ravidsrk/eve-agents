# eve-exploration Roadmap

Phase-by-phase plan to evolve this repo from **75 eve-shaped agents with lab wiring** into **the public Vercel eve agent catalog** — job breadth (50 templates), integration depth (production), and official deploy alignment (AI Gateway, Vercel Sandbox, Connect, evals).

**Status:** Phase 3 complete (S-tier + A-tier) · **Last updated:** 2026-06-19

---

## Guiding principles

1. **Dual-track forever** — Lab track (OpenRouter + SuperServe, no Vercel account) and Vercel track (AI Gateway + native Sandbox + Connect) share the same `agent/` files. Switching is env-driven, not a fork.
2. **Agents-first** — No new top-level cruft. Extend `packages/`, `scripts/`, and per-agent `evals/`, `channels/`, `connections/`.
3. **Incremental deploy proof** — One flagship on Vercel before scaling deploy to more agents.
4. **Evals as the quality gate** — Structural verify stays keyless; scored evals gate deploys and deepening work.
5. **Reference stays upstream-aligned** — Port from [vercel/eve](https://github.com/vercel/eve) when fixtures change; catalog drift must not break reference parity.

---

## Architecture target (end state)

```text
┌─────────────────────────────────────────────────────────────────┐
│                     eve-exploration (monorepo)                   │
├─────────────────────────────────────────────────────────────────┤
│  Track A (Lab)              │  Track B (Vercel-native)          │
│  OPENROUTER_API_KEY         │  VERCEL + AI Gateway OIDC         │
│  SUPERSERVE_API_KEY         │  Vercel Sandbox (default)         │
│  @eve-catalog/openrouter    │  model: 'openai/gpt-5.4-mini'     │
│  @eve-catalog/superserve    │  Vercel Connect for channels      │
├─────────────────────────────────────────────────────────────────┤
│  packages/eve-catalog-profile  → resolveModel(), resolveSandbox()│
│  packages/agent-kit            → catalog tools (A01–A50)         │
│  packages/monid-tools          → production only (P01–P10)       │
└─────────────────────────────────────────────────────────────────┘
```

### Vercel stack map (what eve compiles into)

| Layer | Role | eve surface |
| --- | --- | --- |
| **eve core** | Discovers `agent/`, runs agent loop | `defineAgent`, `defineTool`, `defineChannel`, … |
| **Vercel Workflow** | Durable checkpointed sessions | Every turn is a workflow step |
| **Vercel Functions** | Hosts compiled agent | `vercel deploy` |
| **AI Gateway** | `provider/model`, failover, OIDC | `model: 'openai/gpt-5.4-mini'` |
| **Vercel Sandbox** | Isolated bash/files for agent code | `agent/sandbox/*` or default on deploy |
| **Vercel Connect** | OAuth for Slack, GitHub, Linear, … | `connections/*` + channel auth |
| **Channels** | HTTP (default), Slack, GitHub, … | `agent/channels/*` |
| **Schedules** | Cron-triggered runs | `agent/schedules/*` → Vercel Cron |
| **Evals** | Scored test suites | `eve eval --strict` |
| **Observability** | Agent Runs dashboard | Built-in; optional `instrumentation.ts` |

Official ship path: `eve dev` → `eve eval` → `vercel deploy` → preview deployments carry channels → instant rollback.

---

## Current state vs target

| Capability | Today | Target |
| --- | --- | --- |
| Models | `@eve-catalog/openrouter` + API key | Dual-track: OpenRouter locally, AI Gateway on Vercel |
| Sandbox | `@eve-catalog/superserve-backend` | Dual-track: SuperServe locally, Vercel Sandbox on deploy |
| Deploy | None | 2+ flagships on Vercel with Agent Runs evidence |
| Evals | Reference (10) only | All 50 catalog agents ≥1 eval; S-tier ≥2 |
| Channels | `integrations/10-slack` proof | S-tier catalog agents (04, 06, 11, 17, 30, 50) |
| CI | `verify:catalog` only | + preview deploy + flagship evals + reference (blocking) |

---

## Phase 0 — Foundation & contracts

**Timeline:** Week 0 (~3–5 days)  
**Goal:** Shared abstractions so later phases do not refactor 75 agents individually.

### Deliverables

| ID | Deliverable | Location |
| --- | --- | --- |
| 0.1 | `resolveModel()` / `resolveSandbox()` | `packages/profile/` |
| 0.2 | Environment contract | `README.md` + this doc |
| 0.3 | Deploy playbook (one agent) | `docs/DEPLOY.md` |
| 0.4 | Package rename | `@eve-catalog/*` → `@eve-catalog/*` |

### Tasks

**0.1 — Profile package**

```typescript
// packages/profile/index.ts (concept)
export function resolveModel(overrides?: { lab?: string; vercel?: string }) {
  if (process.env.VERCEL) return overrides?.vercel ?? "openai/gpt-5.4-mini";
  return orModel(process.env.OPENROUTER_MODEL);
}

export function resolveSandbox(opts: SuperServeOpts) {
  if (process.env.VERCEL || !process.env.SUPERSERVE_API_KEY) return undefined;
  return superserveBackend(opts);
}
```

- Add `agent/lib/runtime.ts` (or extend generator) importing from `@eve-catalog/profile`.
- Update `scripts/generate-catalog.mjs` for dual-track template on new agents.

**0.2 — Environment matrix**

| Variable | Lab | Vercel deploy |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Required | Omit |
| `SUPERSERVE_API_KEY` | Required (sandbox agents) | Omit |
| `VERCEL_OIDC_TOKEN` | N/A | Auto on Vercel |
| `MONID_API_KEY` | Production only | Optional |
| `FF_CONNECT_ENABLED` | N/A | For Slack/GitHub channels |

**0.3 — Package rename**

- Rename `packages/openrouter`, `superserve-backend`, `agent-kit`, `monid-tools` to `@eve-catalog/*`.
- Update all workspace `package.json` files and `scripts/verify-catalog.mjs`.
- Single commit; `npm test` must stay green.

### Success criteria

- [ ] Agent `06-incident-commander` uses `resolveModel()` / `resolveSandbox()` with existing lab keys
- [ ] `npm test` passes on Linux CI
- [ ] README documents both tracks

### Risks

- Workspace rename touches 50+ packages — do once, early.
- `verify-catalog.mjs` checks `arch-${dir}` names — update if package scope changes.

---

## Phase 1 — First Vercel deploy

**Timeline:** Week 1–2  
**Goal:** Prove official ship path: `vercel deploy` → HTTP session → Agent Runs.

### Flagship

- **Primary:** `agents/catalog/06-incident-commander`
- **Backup:** `agents/catalog/04-support-ticket-triage`

### Deliverables

| ID | Deliverable |
| --- | --- |
| 1.1 | Vercel project linked (agent dir as deploy root) |
| 1.2 | Deploy without OpenRouter/SuperServe keys |
| 1.3 | Documented preview URL + `curl` session flow |
| 1.4 | 3 evals on flagship |
| 1.5 | Agent Runs evidence in flagship README |
| 1.6 | `evidence/deploy-smoke.json` |

### Evals (minimum 3)

| Eval | Asserts |
| --- | --- |
| `smoke-reply.eval.ts` | Session completes, non-empty reply |
| `tools-dossier.eval.ts` | Called `load_dossier`, `write_report` |
| `incident-content.eval.ts` | Reply mentions containment / timeline / owner |

### Agent changes (06 only)

- `agent/agent.ts` → `model: resolveModel()`
- `agent/sandbox/sandbox.ts` → conditional; omit backend on Vercel
- `.vercelignore` → exclude `.workflow-data/`, `run.log`, `.env.local`

### Success criteria

- [ ] `vercel deploy` succeeds without lab keys
- [ ] HTTP session returns sensible incident report from seeded dossier
- [ ] Agent Runs shows session in Vercel dashboard
- [ ] 3/3 evals pass against preview URL

### Out of scope

- Slack channel
- All 50 agents on Vercel
- Reference eval CI gate

### Gate G1

After Phase 1: **Does A06 deploy without lab keys?** If no, fix profile/sandbox before Phase 3.

---

## Phase 2 — CI & quality gates

**Timeline:** Week 2–3  
**Goal:** PRs get preview deploy + eval smoke; main stays keyless-structural.

### Deliverables

| ID | Deliverable |
| --- | --- |
| 2.1 | `.github/workflows/deploy-preview.yml` (flagship) |
| 2.2 | `.github/workflows/eval-flagship.yml` |
| 2.3 | `scripts/eval-flagship.sh` |
| 2.4 | Reference validation job (non-blocking initially) |
| 2.5 | `.gitignore` for `run.log`, `.workflow-data/` |

### CI matrix

| Job | Trigger | Keys | Blocking |
| --- | --- | --- | --- |
| `verify` | every PR | None | Yes |
| `typecheck` | every PR | None | Yes |
| `deploy-preview` | PR / main | `VERCEL_TOKEN` | No → Yes for flagship |
| `eval-flagship` | after preview | Preview URL | Yes for flagship changes |
| `validate-reference` | nightly / manual | OpenRouter | No (flaky HITL) |

### Success criteria

- [ ] PR touching flagship gets preview URL comment
- [ ] Eval job passes on green flagship PRs
- [ ] `npm test` keyless on every PR

### Gate G2

After Phase 2: **Do preview evals pass reliably?** If no, do not block PRs yet.

---

## Phase 3 — Deepen top 10 catalog agents

**Timeline:** Week 3–6  
**Goal:** Turn matrix rows into showcase templates — evals, domain tools, Vercel primitives.

### Tiering

| Tier | Agents | Phase 3 scope |
| --- | --- | --- |
| **S** (showcase) | 06, 04, 01, 11, 17 | Evals + deploy candidate + 1 primitive |
| **A** (deepen) | 02, 05, 33, 39, 50 | Evals + domain tool; deploy optional |
| **B** (maintain) | Remaining 40 | Structural + dry-run until Phase 5 |

### Per-agent spec

| Agent | Vercel primitive | Work |
| --- | --- | --- |
| **A06** Incident commander | Schedule + Slack | `schedules/digest.ts`; port Slack from `integrations/10-slack` |
| **A04** Support triage | Connect + skills | KB skill expansion; optional MCP connection stub |
| **A01** Revenue analyst | Sandbox + SQL | `run_aggregate.ts` on seeded CSV; sandbox eval |
| **A11** PR triage | GitHub channel | `connections/github.ts`; diff tool from seeded patch |
| **A17** Content pipeline | Multi-step eval | 3-turn eval: draft → review → revise |
| **A02** Sales lead researcher | Schedule | `schedules/inbound-lead.ts` |
| **A05** Refund approval | HITL | `needsApproval` on side-effecting tool |
| **A33** RAG support | Grounded retrieval | Eval for citation from `kb/` |
| **A39** Code interpreter | Vercel Sandbox | Deploy smoke with `bash`/`python` |
| **A50** Fleet router | Subagents | 2–3 subagents; routing eval |

### Package extractions

| From | To |
| --- | --- |
| `integrations/20-swarm` | `@eve-catalog/agent-kit` (`swarm_run`) |
| `integrations/10-slack` patterns | Docs + copy into S-tier agents |
| `integrations/08-hitl` | `needsApproval` on A05 |

### S-tier deliverables (each)

1. `evals/` — ≥2 evals
2. README — “Deploy on Vercel” section
3. `agent/lib/runtime.ts` — dual-track
4. One primitive (`channels/`, `schedules/`, or `connections/`)
5. Evidence note in README or `VERIFY-LIVE.md`

### Sequencing

```text
Week 3: A06 (schedule) + A05 (HITL)
Week 4: A04 + A33
Week 5: A01 + A39
Week 6: A11 + A17 + A02 + A50
```

### Success criteria

- [x] 10 agents have `evals/` with ≥2 passing evals locally (A06, A04, A01, A11, A17, A33, A02, A39, A50, A05 HITL)
- [x] 5 S-tier agents documented for Vercel deploy (A06, A04, A01, A11, A17)
- [x] A05 HITL eval passes (`npm run eval:hitl-catalog`)
- [x] A50 subagent eval passes (`fleet-routing.eval.ts`)
- [x] `swarm_run` in agent-kit (used by A50 + integrations/20-swarm)

### Gate G3

After Phase 3: **Is HITL eval stable?** If no, defer A05 channel work to Phase 4.

---

## Phase 4 — Channels, Connect & second deploy wave

**Timeline:** Week 6–8  
**Goal:** Demonstrate where agents live — not just HTTP `curl`.

### Deliverables

| ID | Deliverable |
| --- | --- |
| 4.1 | Slack on A06 via Vercel Connect |
| 4.2 | GitHub channel on A11 |
| 4.3 | Schedule on A02 or A21 |
| 4.4 | Second deploy: **A04** or **A01** |
| 4.5 | `integrations/10-slack` superseded by A06 pattern (note in README) |
| 4.6 | Connect setup guide — `docs/CONNECT.md` |

### Connect workflow (canonical)

```bash
export FF_CONNECT_ENABLED=1
vercel connect create slack --triggers
vercel connect attach <uid> --trigger-path /eve/v1/slack --triggers --yes
vercel deploy --prod
```

### Cross-channel story (A06)

1. HTTP webhook receives alert payload
2. Agent starts investigation
3. Optional handoff to Slack thread (Connect)
4. CI: HTTP trigger only; Slack manual dogfood

### CI evolution

| Job | Status |
| --- | --- |
| `validate:reference` | **Blocking** on main |
| `eval:s-tier` | 5 S-tier evals when catalog changes |
| `deploy-preview` | Support flagships 06 + 04 |

### Success criteria

- [ ] A06 answers in Slack (screenshot / run note)
- [ ] A21 or A02 schedule fires (or dev dry-run documented)
- [ ] 2 agents on production Vercel URLs
- [ ] Reference evals green on main ×3 consecutive runs

### Gate G4

After Phase 4: **Connect Slack working?** If no, keep HTTP-only story; do not over-promise channels.

---

## Phase 5 — Production layer & catalog scale

**Timeline:** Week 8–12  
**Goal:** Clarify production vs catalog; scale evals across all 50 agents.

### Layer roles (hybrid)

| Layer | Role | External deps |
| --- | --- | --- |
| **Catalog A01–A50** | Copy-paste job templates | Seeded data + agent-kit |
| **Production P01–P10** | Deep integration examples | Monid; document Gateway alternative |
| **Reference R01–R10** | Upstream parity | Track `vercel/eve` releases |
| **Integrations (5)** | Primitive proofs | Fold patterns into catalog; keep or trim |

### Tasks

**5.1 — Production dual-track**

- P01–P03: `resolveModel()`; keep Monid behind `MONID_API_KEY`
- Document: production agents require Monid; catalog agents do not

**5.2 — B-tier batch evals**

- `scripts/scaffold-eval.mjs` — one smoke eval per remaining catalog agent
- CI: rotate 10 random catalog evals per PR (bounded time)

**5.3 — Upstream sync**

- Run `scripts/port-eve-fixture.sh` on `vercel/eve` releases
- `CONTRIBUTING.md` — how to add agent #51

**5.4 — Public positioning**

- README: “Deploy incident commander in 5 minutes”
- Link [Vercel eve docs](https://vercel.com/docs/eve) + this catalog
- Optional: community link on [vercel.com/kb/eve](https://vercel.com/kb/eve)

### Success criteria

- [ ] All 50 catalog agents have ≥1 eval
- [ ] P01–P10 smoke on lab track; P01 Vercel deploy optional
- [ ] Reference synced to latest `vercel/eve` tag
- [ ] `AGENT_CATALOG.md` lists deploy tier (S/A/B) per agent

### Gate G5

After Phase 5: **Are 50 evals worth CI time?** If no, keep rotation sampling.

---

## Phase 6 — Fleet & observability (ongoing)

**Timeline:** Week 12+  
**Goal:** Operate the catalog like Vercel operates d0 / V / Vertex.

### Deliverables

- **A50** fleet router deployed or subagent-only demo
- **OpenTelemetry** on one flagship (`agent/instrumentation.ts`)
- **Cost runbook** — AI Gateway spend from Agent Runs
- **Rollback drill** documented
- **Monthly** `eve@latest` + `port-eve-fixture` bump

### Success criteria

- [ ] Fleet router: one HTTP entry → specialist delegation
- [ ] OTel traces alongside Agent Runs
- [ ] Rollback tested on flagship

---

## Master timeline

```text
Phase 0  ████░░░░░░░░  Week 0      Foundation / rename
Phase 1  ░░██████░░░░  Week 1–2    First deploy (A06)
Phase 2  ░░░░████░░░░  Week 2–3    CI preview + evals
Phase 3  ░░░░░░████████████  Week 3–6  Deepen top 10
Phase 4  ░░░░░░░░░░░░██████  Week 6–8  Connect + 2nd deploy
Phase 5  ░░░░░░░░░░░░░░████████  Week 8–12  Scale evals + production
Phase 6  ░░░░░░░░░░░░░░░░░░████→  Ongoing  Fleet + OTel
```

---

## Vercel production fleet ↔ catalog mapping

| Vercel internal agent | Catalog peers |
| --- | --- |
| d0 (data analyst) | A01, A22, A39, P06 |
| Lead Agent (SDR) | A02, P08 |
| Athena (sales cockpit) | A01, A02, A03 |
| Vertex (support) | A04, A33, P05 |
| draft0 (content) | A17, A18 |
| V (fleet router) | A50 |

---

## Explicitly deferred

- Deploying all 50 agents to Vercel
- Replacing Monid with Connect for all production agents
- Web chat UI / Next.js shell (unless prioritized later)
- Committing full `run.log` files (summaries only)

---

## Cost notes

| Item | Notes |
| --- | --- |
| Vercel Pro | Connect, Cron, longer functions |
| AI Gateway | Low for flagship smoke (gpt-5.4-mini) |
| OpenRouter | Lab + nightly reference |
| SuperServe | Lab sandbox |
| Monid | Production only |

---

## Phase 0 kickoff (next PR)

1. Create `packages/profile` with `resolveModel` / `resolveSandbox`
2. Wire into `06-incident-commander` only
3. Rename `@eve-catalog/*` → `@eve-catalog/*`
4. Add `docs/DEPLOY.md` stub
5. Phase 1 PR: Vercel link + deploy + 3 evals

---

## Progress log

| Phase | Status | Notes |
| --- | --- | --- |
| 0 | Done | `@eve-catalog/profile`, rename `@lab/*`, dual-track on 50 agents |
| 1 | Done (lab) | Flagship 3/3 live evals; `eve build` OK; Vercel deploy pending token |
| 2 | Done (lab) | CI structure + typecheck; optional Vercel preview job |
| 3 | Started | A05 `refund_charge` + `npm run eval:hitl-catalog` PASS |
| 3 | Not started | |
| 4 | Not started | |
| 5 | Not started | |
| 6 | Not started | |

Update this table as phases complete.