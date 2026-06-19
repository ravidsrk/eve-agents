# DECISIONS

## 2026-06-19 — FRESH adversarial review run

### Self-orientation
- **REPO_ROOT:** `/Users/ravindra/projects/eve-exploration`
- **Product:** Public catalog of 75 Vercel eve agents (catalog/reference/production/integrations). Node 24 monorepo; dual-track lab (OpenRouter + SuperServe) vs Vercel (AI Gateway + Sandbox).
- **MAINTAINER:** Ravindra Kumar `<ravidsrk@gmail.com>` (from `git config`)
- **BASE:** `ravidsrk/adversarial-fresh` cut from `main` @ `f3c9f9b`
- **Default branch:** `main`
- **Remote:** `https://github.com/ravidsrk/eve-exploration`

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
- Merge ≠ deploy; BASE→main is human-owned
- Infra apply = OPS (record in `docs/arch-ops-actions.md`, not executed)
- No secrets in commits; gitleaks before push
- Preserve merge commits; never squash

### Placement defaults
- Independent fixes → new worktree + branch `ravidsrk/<slug>` off BASE
- Review-fix cycles → same worktree fresh terminal
- One in-flight task per hot file; parallelize across independent files