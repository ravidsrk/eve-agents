# eve-exploration Roadmap

Phase-by-phase plan to evolve this repo from **75 eve-shaped agents with lab wiring** into **the public Vercel eve agent catalog**.

**Status:** Phases 0–5 complete · Phase 6 operational docs shipped · **Last updated:** 2026-06-19

---

## Progress summary

| Phase | Status | Completion |
| --- | --- | ---: |
| 0 Foundation | Done | 100% |
| 1 First deploy | Done | 100% |
| 2 CI gates | Done | 100% |
| 3 Deepen top 10 | Done | 100% |
| 4 Channels + deploy | Done | 100% |
| 5 Scale + production | Done | 100% |
| 6 Fleet + observability | Done (v1) | 100% |

**Production URLs:** [eve-incident-commander.vercel.app](https://eve-incident-commander.vercel.app) · [eve-support-triage.vercel.app](https://eve-support-triage.vercel.app)

---

## Guiding principles

1. **Dual-track forever** — Lab (OpenRouter + SuperServe) and Vercel (AI Gateway + Sandbox + Connect) share the same `agent/` files.
2. **Agents-first** — Extend `packages/`, `scripts/`, per-agent `evals/`, `channels/`.
3. **Evals as quality gate** — Structural verify keyless; live evals for S/A tier.
4. **Reference stays upstream-aligned** — Port from [vercel/eve](https://github.com/vercel/eve); see [VERIFY-REFERENCE.md](docs/VERIFY-REFERENCE.md).

---

## Phase 0 — Foundation ✅

- [x] `@eve-catalog/profile` — `resolveModel()` / `resolveSandbox()`
- [x] Dual-track on 50 catalog agents
- [x] `docs/DEPLOY.md`, `@eve-catalog/*` packages
- [x] `npm test` passes on CI

---

## Phase 1 — First Vercel deploy ✅

- [x] A06 linked + prebuilt deploy
- [x] No OpenRouter/SuperServe on Vercel build
- [x] Production URL + `smoke:deployed` session flow
- [x] 5 flagship evals (≥3 required)
- [x] `evidence/deploy-smoke.json` + Agent Runs via dashboard

---

## Phase 2 — CI & quality gates ✅

- [x] `structure` + `typecheck` blocking
- [x] Optional `eval-s-tier`, `deploy-preview` (prebuilt), `eval-catalog-rotate`
- [x] `validate-reference` on main when `OPENROUTER_API_KEY` secret set
- [x] Keyless `npm test` every PR

---

## Phase 3 — Deepen top 10 ✅

- [x] S-tier (06, 04, 01, 11, 17) — evals + primitives
- [x] A-tier (02, 05, 33, 39, 50) — schedules, HITL, sandbox, swarm
- [x] `swarm_run` in agent-kit
- [x] `npm run eval:s-tier` / `eval:a-tier` / `eval:hitl-catalog`

---

## Phase 4 — Channels, Connect & second deploy ✅

- [x] A06 Slack + alert webhook channels
- [x] A11 GitHub channel
- [x] A02 schedule eval
- [x] A04 production: https://eve-support-triage.vercel.app
- [x] `docs/CONNECT.md`, `evidence/connect-slack.md`
- [x] `catalogRouteAuth()` — production HTTP basic + OIDC (no `placeholderAuth`)

---

## Phase 5 — Production layer & catalog scale ✅

- [x] 50/50 catalog agents ≥1 eval (64 files)
- [x] P01–P10 dual-track via `@eve-catalog/profile`
- [x] `npm run smoke:production:build`
- [x] `AGENT_CATALOG.md` deploy tiers (S/A/B)
- [x] `CONTRIBUTING.md`, README 5-minute deploy
- [x] `eval:catalog:rotate` for bounded CI

---

## Phase 6 — Fleet & observability ✅ (v1)

- [x] A50 fleet routing evals (`eval:a-tier`)
- [x] A06 `agent/instrumentation.ts` (OTEL hook)
- [x] `docs/COST-RUNBOOK.md`
- [x] `docs/ROLLBACK.md`

---

## Manual follow-ups (optional)

| Item | Action |
| --- | --- |
| GitHub secrets | `OPENROUTER_API_KEY`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, project IDs |
| CI vars | `EVAL_S_TIER_ENABLED`, `VERCEL_DEPLOY_ENABLED`, `EVAL_ROTATE_ENABLED` |
| Live Slack | `vercel connect` on A06 — see `docs/CONNECT.md` |
| Reference 10/10 | HITL/sandbox fixtures may flake on OpenRouter — see `docs/VERIFY-REFERENCE.md` |

---

## Progress log

| Phase | Status | Notes |
| --- | --- | --- |
| 0 | Done | profile + dual-track |
| 1 | Done | A06 production |
| 2 | Done | CI matrix |
| 3 | Done | S/A tier |
| 4 | Done | 2 production URLs, channels |
| 5 | Done | 50 evals, P01–P10, CONTRIBUTING |
| 6 | Done | OTel hook, cost/rollback runbooks |