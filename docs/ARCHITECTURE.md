# Architecture

Eve Agents is a Node 24 monorepo: **75 eve agents** plus shared **packages** and **scripts** that wire lab and Vercel runtimes.

## Layers

Folder paths are stable; doc labels describe each layer's role.

```text
agents/
  catalog/        Templates — 50 job templates (generated + hand-customized)
  reference/      Framework reference — 10 vercel/eve e2e fixtures
  production/     Depth examples — 10 Monid-integrated agents
  integrations/   Primitive proofs — HITL, durable, swarm, …
packages/
  profile/        Dual-track model + sandbox resolution
  openrouter/     Lab inference client
  superserve-backend/  Lab sandbox backend
  agent-kit/      Shared catalog tools + routeAuth()
  monid-tools/    Budget-capped Monid client
scripts/          Setup, runners, verify, deploy
```

## Dual-track runtime

`@eve-agents/profile` picks the track from environment:

| Track | Trigger | Model | Sandbox |
| --- | --- | --- | --- |
| **Lab** | Local dev, CI with keys | OpenRouter via `@eve-agents/openrouter` | SuperServe via `@eve-agents/superserve-backend` |
| **Vercel** | `VERCEL=1` build/deploy | AI Gateway OIDC (`openai/gpt-5.4-mini` default) | eve default (Vercel Sandbox) |

Template and depth-example agents call `resolveModel()` and `resolveSandboxDefinition()` from their `agent/agent.ts` and `agent/sandbox/sandbox.ts`.

## Shared tools (`@eve-agents/agent-kit`)

All template agents re-export six tools from `packages/agent-kit/tools.js`:

- `load_dossier`, `search_records`, `analyze_records` — read seeded JSON under `agent/data/`
- `write_report`, `record_decision` — write artifacts (approval-gated for side effects)
- `fetch_live_json` — off by default; HTTPS + allowlist when `ALLOW_EXTERNAL_FETCH=1`

**App root:** tools resolve data via `EVE_APP_ROOT` or upward walk (not bare `process.cwd()`).

**Artifacts:** writes go to `EVE_ARTIFACTS_DIR` or `/tmp` on serverless (`VERCEL=1`).

## Authentication

| Surface | Mechanism |
| --- | --- |
| HTTP session (`/eve/v1/session`) | `routeAuth()` — localDev + Vercel OIDC + optional HTTP basic |
| Alert webhook (`/incident`) | `ALERT_WEBHOOK_SECRET` header (flagship A06) |
| Slack / GitHub | Vercel Connect + channel-specific secrets |

See [SECURITY.md](./SECURITY.md).

## Secrets layout

One file at repo root: **`.secrets/eve.env`** (gitignored). Setup no longer copies it into every agent directory — eve and package clients walk up to find it.

## CI gates (keyless)

`npm run test:structure` runs:

- `verify:catalog` — file layout, dossier shape
- `verify:runtime` — dual-track snippets in agents
- `verify:evals` — eval config presence
- Package unit tests (profile, agent-kit, monid-tools)

Push to `main` also runs **gitleaks** and **typecheck**.

## Flagship deploy path

```text
npm ci → VERCEL=1 eve build → vercel deploy --prebuilt
```

Workspace packages are not published to npm; the monorepo must build locally before prebuilt deploy.