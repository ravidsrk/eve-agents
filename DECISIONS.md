# DECISIONS

## 2026-06-19 — FRESH adversarial review run

### Self-orientation
- **REPO_ROOT:** `/Users/ravindra/projects/eve-agents`
- **Product:** Eve Agents — 75 Vercel eve agents across templates, framework reference, depth examples, and primitive proofs. Node 24 monorepo; dual-track lab (OpenRouter + SuperServe) vs Vercel (AI Gateway + Sandbox).
- **MAINTAINER:** Ravindra Kumar `<ravidsrk@gmail.com>` (from `git config`)
- **BASE:** `ravidsrk/adversarial-fresh` cut from `main` @ `f3c9f9b`
- **Default branch:** `main`
- **Remote:** `https://github.com/ravidsrk/eve-agents`

### Runtime preconditions
- **Orca runtime:** ready (`orca status --json`)
- **gh auth:** authenticated as `ravidsrk`
- **gitleaks:** 8.30.1 installed
- **Worktrees:** single worktree at REPO_ROOT on BASE (no sibling review worktree disturbed)

### Worker launch flags
- **Claude (REVIEWER/INTEGRATOR):** `--dangerously-skip-permissions` / auto mode
- **Codex (SKEPTIC/REVIEW):** `codex --full-auto`
- **Grok (CODE/T_FINAL):** auto, max effort

### Orchestration mode
- Manual coordinator loop (not `orchestration run`)
- File ledger: `docs/arch-build-progress.md`
- Fresh review output: `docs/adversarial-review-fresh.md`
- Prior `adversarial-review*.md` and in-flight review branches: **ignored, not read**

### Safety rails (non-negotiable)
- Testnet/staging/fixtures only for acceptance
- Merge ≠ deploy; BASE→main is human-owned (completed via PR #9)
- Infra apply = OPS (record in `docs/arch-ops-actions.md`, not executed)
- No secrets in commits; gitleaks before push
- Preserve merge commits; never squash

## 2026-07-08 — Adversarial closeout on main

- Confirmed all CODE findings from `docs/adversarial-review-fresh.md` are present on `main`.
- Wired remaining acceptance into keyless CI: `verify:production`, `@eve-agents/agent-kit` tests, superserve `toCommand` tests, REL-002 stream-capture unit tests, SEC-001 smoke rejects unauthenticated/wrong secret.
- Updated readiness/ops docs: BASE→main promotion is done; remaining work is human OPS only.

## 2026-07-08 — Phase 7 hardening

- **Next after closeout:** make DEP-001 and Monid spend durable without requiring human OPS for every cold start.
- Dependabot for npm + Actions; `run-typecheck.mjs` prefers `tsgo` and falls back to `tsc --noEmit`.
- Monid `seedSpentFromLedger()` so budget caps survive process restarts when the ledger path is sticky.
- Human-only leftovers: `ALERT_WEBHOOK_SECRET` on Vercel, paid gateway evals, optional tsgo vendor mirror.

### Placement defaults
- Independent fixes → new worktree + branch `ravidsrk/<slug>` off BASE
- Review-fix cycles → same worktree fresh terminal
- One in-flight task per hot file; parallelize across independent files

### Orca repo registration
- **eve-agents** registered in Orca: `id:db33b07b-194a-4fa4-8d0b-f01efd0f164b` at `/Users/ravindra/projects/eve-agents`