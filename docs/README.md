# Documentation

Guides for developing, deploying, and operating the Eve Agents library.

## Getting started

| Doc | When to read |
| --- | --- |
| [../README.md](../README.md) | First visit — layout, quick start, command index |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Adding agents, PR checklist, dual-track rules |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | How packages, tracks, and agents fit together |
| [SECURITY.md](./SECURITY.md) | Secrets, auth env vars, webhook hardening |

## Deploy and operate

| Doc | When to read |
| --- | --- |
| [DEPLOY.md](./DEPLOY.md) | Vercel prebuilt deploy, smoke, deployed evals |
| [CONNECT.md](./CONNECT.md) | Slack and GitHub via Vercel Connect |
| [COST-RUNBOOK.md](./COST-RUNBOOK.md) | AI Gateway, OpenRouter, SuperServe, Monid budgets |
| [ROLLBACK.md](./ROLLBACK.md) | Roll back a bad flagship deployment |
| [VERIFY-REFERENCE.md](./VERIFY-REFERENCE.md) | Reference fixture eval parity (9/10 typical) |

## Agent layers

| Path | Doc |
| --- | --- |
| Templates — `agents/catalog/` (50) | [../agents/catalog/README.md](../agents/catalog/README.md) |
| Framework reference — `agents/reference/` (10) | [../agents/reference/README.md](../agents/reference/README.md) |
| Depth examples — `agents/production/` (10) | [../agents/production/README.md](../agents/production/README.md) |
| Primitive proofs — `agents/integrations/` (5) | [../agents/integrations/README.md](../agents/integrations/README.md) |
| Shared packages | [../packages/README.md](../packages/README.md) |

## Indexes and planning

| Doc | Purpose |
| --- | --- |
| [../AGENT_CATALOG.md](../AGENT_CATALOG.md) | Full catalog index with tiers and ports |
| [../AGENT_MATRIX.md](../AGENT_MATRIX.md) | Matrix view for planning new agents |
| [../ROADMAP.md](../ROADMAP.md) | Phased delivery history and scope |
| [../VERIFY-LIVE.md](../VERIFY-LIVE.md) | Live-run evidence notes |

## Engineering records

| Doc | Purpose |
| --- | --- |
| [adversarial-review-fresh.md](./adversarial-review-fresh.md) | Code-grounded architecture review (2026-06) |
| [arch-build-readiness.md](./arch-build-readiness.md) | Finding close-out after review fixes |
| [arch-ops-actions.md](./arch-ops-actions.md) | Human-owned OPS queue (not automated) |