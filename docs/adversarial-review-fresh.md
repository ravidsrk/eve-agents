# Adversarial Architecture Review (code-grounded, fresh)

Scope: `packages/*`, `agents/{catalog,production,reference,integrations}/*`, `scripts/*`, `.github/workflows/ci.yml`, root `package.json`. Read-only on code; every finding cites a file:line read directly from source on branch `ravidsrk/p0-review`. Prior review docs were not read or cited.

Reviewer stance: adversarial. Severities assume the catalog is what its own README claims, "a public catalog of real-world Vercel eve agents," with the flagship (`06-incident-commander`) and support agent (`04-support-ticket-triage`) actually deployable to Vercel via CI (`.github/workflows/ci.yml:90`).

## Executive summary

The shared primitives are well-shaped: a real HITL approval gate, a clean dual-track (Vercel vs lab) model/sandbox resolver, a budget-capped Monid client, and a thorough keyless structure-verification suite. The risk concentrates in three places: stateful guards running in a stateless serverless target (budget counter, filesystem writes), an unauthenticated ingestion webhook on the one agent CI deploys, and repo hygiene (25 MB of live NDJSON traces committed, plus a "regenerate" command that deletes the flagship's hand-authored source).

Counts: 1 P0, 4 P1, 8 P2, 7 P3. The P0 and three of the P1s are functional or security breaks on the deployed flagship; the fourth P1 is a maintainer-facing data-loss footgun.

Verification honesty: `eve` is not installed in this worktree (`node_modules/eve` absent; lockfile pins `eve@0.11.4`), so claims about eve's runtime defaults are flagged as needing a live check. Findings grounded purely in this repo's own code are stated as certain.

## How to read a finding

Each finding lists: ID, severity, problem with evidence, fix naming an in-tree primitive, acceptance criterion (a test or smoke that proves the fix), and a CODE vs CODE+OPS tag (CODE = code change alone closes it; CODE+OPS = code plus an operational/config/process change).

## Security

### SEC-001 (P0): `/incident` webhook has no authentication and self-asserts a trusted service principal

Evidence: `agents/catalog/06-incident-commander/agent/channels/alert.ts:9-32`. The route `POST("/incident", ...)` declares no auth and, inside the handler, calls `send(message, { auth: { authenticator: "alert-webhook", principalType: "service", principalId: "incident-ingest", attributes: body } })`. The sibling `eve.ts` channel does apply `catalogRouteAuth()` (`channels/eve.ts:4-6`), but the alert channel is a separate `defineChannel` with no auth declared. `scripts/smoke-alert-webhook.sh:12-14` confirms the route is exercised with no auth header. Any caller who can reach the deployed URL triggers a full agent investigation session (model inference plus tool calls), i.e. denial-of-wallet, and the session is labeled as a trusted internal service call.

Fix: gate the route before `send()`. Reuse the same posture as `eve.ts` by requiring a shared secret: read `process.env.ALERT_WEBHOOK_SECRET`, compare a request header against it with the already-imported-style Node `crypto` (the file already uses `crypto.randomUUID()` at `alert.ts:15`) via `crypto.timingSafeEqual`, and return `401` on mismatch. If `defineChannel` supports a channel-level `auth` option, prefer wiring `catalogRouteAuth()` there for consistency with `eve.ts`.

Acceptance: `bash scripts/smoke-alert-webhook.sh` against a deployed preview returns `401` with no/incorrect secret and `200 {ok,sessionId}` only with the correct `ALERT_WEBHOOK_SECRET` header. Add a dev-route eval mirroring `evals/webhook-alert.eval.ts:13` that asserts the unauthenticated POST is rejected.

Tag: CODE. (Severity is P0 on the certain auth-model flaw of self-asserting a service principal on an open route; if a live unauthenticated curl against a preview returns `401` because eve applies a platform default, downgrade to P2. The smoke script and the absence of any auth in the handler indicate it does not.)

### SEC-002 (P2): `fetch_live_json` is an SSRF primitive when enabled (no host allowlist, no private-range block)

Evidence: `packages/agent-kit/tools.js:134-162`. When `ALLOW_EXTERNAL_FETCH=1`, the tool fetches any model-chosen URL after only an `https:` protocol check (`tools.js:149`). There is no allowlist and no block of private/link-local ranges, so a model (or prompt-injected content) can drive requests to internal HTTPS services reachable from the runtime.

Fix: after `new URL(url)` (`tools.js:148`), resolve and reject private/loopback/link-local/metadata targets, and gate on an allowlist env (e.g. `FETCH_ALLOW_HOSTS`) using the same env-guard pattern already used for `ALLOW_EXTERNAL_FETCH`. Keep the https-only check.

Acceptance: a unit test calls the tool with `ALLOW_EXTERNAL_FETCH=1` and `https://169.254.169.254/...` (and a `https://localhost` variant) and gets `{blocked:true}`; an allowlisted host still returns `{status,ok,json}`.

Tag: CODE.

### SEC-003 (P2): production agents ship no channel auth wrapper, unlike catalog

Evidence: no `agent/channels/` directory exists under any `agents/production/*` (verified: `find agents/production -path '*channels*'` returns nothing). Catalog agents generate `agent/channels/eve.ts` with `catalogRouteAuth()` (`scripts/generate-catalog.mjs:145-153`). Production agents (`p06` package at `agents/production/p06-sql-analyst/package.json`) rely entirely on eve's default channel. Locally they are loopback-only (`run-production-agent.sh:35` uses `127.0.0.1`), but the catalog/production asymmetry means a copy-paste deploy of a production agent inherits no route auth.

Fix: add `agent/channels/eve.ts` re-exporting `catalogRouteAuth()` (rename the helper to a neutral `routeAuth()` in `packages/agent-kit/route-auth.js` since it is no longer catalog-specific) to `agents/production/_shared/` and copy it in `scripts/scaffold-production-agent.sh:17-18` alongside `sandbox.ts`.

Acceptance: `scripts/smoke-deployed.sh <prod-url>` returns `401` on `/eve/v1/session` without `ROUTE_AUTH_BASIC_*`; a structure check asserts every `agents/production/*` has `agent/channels/eve.ts`.

Tag: CODE.

### SEC-004 (P3): Vercel token passed on the command line is visible to other processes

Evidence: `scripts/deploy-catalog.sh:24-31` builds `DEPLOY_ARGS+=(--token "$VERCEL_TOKEN")` and runs `npx vercel deploy "${DEPLOY_ARGS[@]}"`. Arguments are visible in the process table (`ps`) to any user on the host/runner.

Fix: drop the `--token` arg; the Vercel CLI reads `VERCEL_TOKEN` from the environment, which is already exported in CI (`ci.yml:116`). Remove lines `24-26`.

Acceptance: `deploy-catalog.sh` succeeds with `VERCEL_TOKEN` in env and no `--token` in argv; `grep -n -- --token scripts/deploy-catalog.sh` returns nothing.

Tag: CODE+OPS.

### SEC-005 (P3): secret sprawl, one secrets file fanned into ~75 per-agent `.env.local` copies

Evidence: `scripts/setup.sh:29-31` loops every `agents/{catalog,reference,production,integrations}/*` and `cp .secrets/eve.env "$d/.env.local"`, and `scripts/lib.sh:16-28` (`ensure_env_local`) re-copies on demand. Every key (OpenRouter, SuperServe, Monid, Vercel) is duplicated into ~75 files. `.gitignore:2-3` (`.env`, `.env.*`) and the generated `.vercelignore` (`generate-catalog.mjs:299-307`) keep them out of git/deploy, so this is sprawl, not leak, but any single agent dir shared or zipped carries all keys.

Fix: have eve load secrets from the repo-root `.secrets/eve.env` (the OpenRouter client already walks up for `.env.local` / `.secrets/eve.env` via `packages/openrouter/load-env.js:5,22-42`); stop fanning copies in `setup.sh`/`ensure_env_local` and rely on the upward walk plus `EVE_APP_ROOT`.

Acceptance: after `setup.sh`, `find agents -name .env.local | wc -l` is `0`, and `npm run run:catalog` still resolves keys via the root secrets file.

Tag: CODE+OPS.

## Cost and abuse

### COST-001 (P1): Monid budget guard is per-process and has a check-then-act race

Evidence: `packages/monid-tools/index.js:38` declares `let _spent = 0` at module scope. `run()` checks `if (_spent + unit > BUDGET_USD)` at `:116` and only later does `_spent += charged` at `:129`, after the awaited `monidFetch` at `:125`. Two consequences: (1) on Vercel each invocation is a fresh process, so `_spent` resets to 0 every request, making `BUDGET_USD` a per-request cap, not a per-user or global one; (2) within one process, concurrent `run()` calls (the model can request multiple tool calls in a single step, observed as `"actions.requested"` count 2 in `agents/production/p06-sql-analyst/run.log`) all read `_spent` before any writes, so N parallel paid calls each see budget room and proceed. Production tools route straight here (`p06-sql-analyst/agent/tools/generate_sql.ts:21`, `explain_sql.ts:15`, `optimize_sql.ts:16`, `p07.../parse_logs.ts:15`).

Fix: serialize the reserve/release around the awaited call. Reserve `unit` before the fetch (`_spent += unit` prior to `:125`), reconcile to the server-reported `charged` after, and refund on throw; this removes the TOCTOU window using only the existing module state. For cross-request durability, persist the running total to the same cost ledger already written (`logCost`, `:44-51`) and seed `_spent` from it on cold start, or accept the per-request cap and document it explicitly.

Acceptance: a unit test firing `Promise.all` of `run()` calls whose combined `unit` exceeds `BUDGET_USD` rejects all but the budgeted subset; a second test asserts a thrown fetch refunds the reservation so `amountSpent()` is unchanged.

Tag: CODE (concurrency + reliability).

### COST-002 (P2): setup defaults set the budget 100x and per-call cap 20x looser than the code defaults

Evidence: `packages/monid-tools/index.js:32-34` defaults `BUDGET_USD=5` and `MAX_CALL_USD=0.25`. `scripts/setup.sh:22-23` writes `MONID_BUDGET_USD=${MONID_BUDGET_USD:-500}` and `MONID_MAX_CALL_USD=${MONID_MAX_CALL_USD:-5}` into `.secrets/eve.env`, which is then fanned to every agent (SEC-005). A fresh clone silently runs with a $500 budget and $5/call cap, 100x and 20x the in-code intent, with no warning.

Fix: make `setup.sh` defaults match the code (`:-5` and `:-0.25`), or remove the lines so the code defaults apply; if a higher lab budget is intentional, emit a visible warning line so the operator sees the elevated cap.

Acceptance: after `setup.sh` with no env overrides, `.secrets/eve.env` shows `MONID_BUDGET_USD=5` / `MONID_MAX_CALL_USD=0.25` (or the script prints the elevated value).

Tag: CODE+OPS.

### COST-003 (P2): cost ledger silently no-ops on Vercel, removing the only spend record on deploy

Evidence: `packages/monid-tools/index.js:36` sets `COST_LOG = process.env.MONID_COST_LOG || "/workspace/.monid-costs.jsonl"`, and `logCost` (`:44-51`) wraps `mkdirSync`/`appendFileSync` in a `try {} catch { /* best-effort */ }`. On Vercel there is no `/workspace` and the filesystem is read-only except `/tmp`, so every paid call's ledger write throws and is swallowed: deployed agents incur Monid spend with no local record.

Fix: default `COST_LOG` to `path.join(os.tmpdir(), "monid-costs.jsonl")` (writable on Vercel), and when the write fails emit one `console.warn` so the no-op is observable instead of silent. Pair with COST-001's persisted total if cross-request budget is wanted.

Acceptance: with `cwd` read-only and no `MONID_COST_LOG`, a `run()` call still appends a line under `os.tmpdir()`; forcing a write failure logs a single warning rather than silently dropping it.

Tag: CODE+OPS.

## Reliability

### REL-001 (P1): `write_report` and `record_decision` write under `process.cwd()`, read-only on Vercel

Evidence: `packages/agent-kit/tools.js:8-10` (`appRoot()` returns `process.cwd()`), `:107-111` (`write_report` does `mkdirSync(path.join(appRoot(), ".agent-artifacts", agentSlug()))` then `writeFileSync`), and `:126-129` (`record_decision`, the approval-gated side effect, appends to `.agent-artifacts/.../decisions.jsonl`). On Vercel Lambda `process.cwd()` is `/var/task` (read-only); only `/tmp` is writable. The deployed flagship's two headline behaviors, writing a report and recording an approved decision, throw `EROFS`/`EACCES` at runtime.

Fix: introduce one `artifactsRoot()` helper returning a writable base, `process.env.EVE_ARTIFACTS_DIR || (isServerless ? os.tmpdir() : process.cwd())`, and route both `write_report` and `record_decision` through it. This is a single chokepoint already shared by all 50 catalog agents (they re-export from this file), so one change fixes the fleet.

Acceptance: with `cwd` set read-only (or `VERCEL=1` plus a read-only `/var/task` shim), an eval drives `record_decision` (approve) and `write_report` and both return their `{path}`/entry without throwing; the deployed-flagship smoke (`smoke-deployed.sh`) exercises a report-writing prompt and gets a `200`.

Tag: CODE.

### REL-002 (P2): catalog stream capture treats a failed turn as success

Evidence: `scripts/stream_until_done.mjs:28-35` sets `done=true` for `session.failed` and `turn.failed` exactly as it does for `session.completed`. After the loop, `process.exitCode` is unset, so `:80-82` prints "stream captured N events" and exits `0`. `run-catalog-agent.sh:60-64` relies on this exit code to declare the run good and writes `run.log` as evidence. Contrast `run-production-agent.sh:51-55`, which explicitly greps for `"type":"turn.completed"` and fails otherwise. The catalog evidence harness therefore records failed turns as passing runs.

Fix: in `stream_until_done.mjs`, track terminal failure separately (set a `failed` flag for `session.failed`/`turn.failed`) and set `process.exitCode = 1` in the final block when `failed` is true, mirroring the production grep. Reuse the existing `done`/`events` bookkeeping.

Acceptance: feeding a stream whose last event is `turn.failed` makes the script exit non-zero; a `turn.completed` stream exits `0`.

Tag: CODE.

### REL-003 (P2): paused-on-dispose plus `rm -rf .eve` leaks SuperServe VMs until the 30-sandbox quota fills

Evidence: `packages/superserve-backend/session.js`-adjacent `index.js:140-147` disposes by `sandbox.pause()` unless `killOnDispose` is set, and `profile/index.js:50-64` constructs `superserveBackend` with only `fromTemplate`/`timeoutSeconds`, so dispose always pauses. Reconnection depends on `superserveSandboxId` captured in session metadata (`index.js:133-138`), but `scripts/lib.sh:46` (`start_eve_dev`) runs `rm -rf .eve` on every boot, discarding eve's local session state. Each catalog/production run thus creates a new VM and pauses the old one without reconnecting; `scripts/cleanup-superserve.mjs:4` documents the symptom ("frees the 30-sandbox team quota"). With 50 catalog plus 10 production agents, the cap fills quickly and `Sandbox.create` starts failing.

Fix: for the ephemeral run harnesses (`run-catalog-agent.sh`, `run-production-agent.sh`), pass `killOnDispose: true` through `resolveSandboxDefinition`/`superserveBackend` so single-shot runs reclaim their VM; keep pause only for `11-durable-resume` where reconnect is the point. Stop unconditionally wiping `.eve` in `start_eve_dev` when durable reconnect is expected (gate the `rm -rf .eve` behind a flag).

Acceptance: running `run-all-production.sh` twice leaves no growth in `node scripts/cleanup-superserve.mjs --dry-run` count attributable to the run harness; the durable test (`durable_test.sh`) still passes.

Tag: CODE+OPS.

### REL-004 (P3): `cleanup-superserve.mjs` kills every sandbox in the team, including in-use durable sessions

Evidence: `scripts/cleanup-superserve.mjs:15-31` lists all sandboxes and `killById` each, with no filter on the `eve-` name prefix (`superserve-backend/index.js:44-46` `sanitizeName`), age, or `status`. Running it during an active `11-durable-resume` session destroys that VM's persisted `/workspace`, defeating durable resume. The header comment says "orphaned" but the code kills all.

Fix: filter to a safe set before killing: skip sandboxes whose `status` is running/active and whose `name` matches a live session, or require an `--older-than` / name-prefix argument. Reuse the `info.name`/`info.status` fields already read at `:20`.

Acceptance: with one active sandbox present, `node scripts/cleanup-superserve.mjs` (no flags) leaves the active one and reports it as skipped; `--all` is required to force-kill everything.

Tag: CODE.

## Data model and repo hygiene

### DATA-001 (P1): 25 MB of live NDJSON traces committed and tracked despite `.gitignore`

Evidence: `git ls-files` returns ~108 tracked `run.log` files (every `agents/*/*/run.log`) plus `evidence/*` artifacts, totaling 25,447,151 bytes (verified via `git ls-files | grep run.log$ | xargs wc -c`). `.gitignore:28-29` lists `run.log` and `**/run.log`, but `git check-ignore agents/production/p06-sql-analyst/run.log` reports NOT ignored because the files are already tracked (gitignore does not untrack). The logs contain full model reasoning traces and tool I/O (`run.log` event histogram: 297 `reasoning.appended`, 242 `message.appended`, plus `action.result` payloads), e.g. `p06-sql-analyst/run.log:1-8`. This is repo bloat, a chain-of-thought/data leak surface, and a false sense of safety (the `.gitignore` entry implies they are excluded).

Fix: `git rm --cached` the tracked `run.log` and per-run `evidence` artifacts (keep curated proofs like `evidence/LIVE-RUN-2026-06-19.md` if intentional), commit the removal, and add a CI gitleaks/secret-scan step (see OPS-001) so re-leaks are caught. The `.gitignore` rules already in place will keep new logs out once untracked.

Acceptance: `git ls-files | grep -c 'run\.log$'` is `0`; `git check-ignore -q agents/production/p06-sql-analyst/run.log` succeeds; repo `.git`-tracked size drops by ~25 MB.

Tag: CODE.

### DATA-002 (P1): `npm run generate:catalog` deletes the flagship's 11 hand-authored files

Evidence: `package.json:scripts.generate:catalog` runs `node scripts/generate-catalog.mjs --clean`; `generate-catalog.mjs:527-529` does `rmSync(path.join(root, "agents", "catalog"), { recursive: true, force: true })`. `writeAgent()` (`:461-500`) regenerates only a fixed file set (one `eve.ts` channel, generic `agent.ts`, six tools, dossier/records, two eval files, metadata). The flagship `06-incident-commander` carries 11 files the generator never produces: `agent/channels/alert.ts`, `channels/slack.ts`, `instrumentation.ts`, `schedules/digest.ts`, `tools/record_digest.ts`, `evals/{smoke-reply,incident-playbook,schedule-digest,webhook-alert}.eval.ts`, `evals/channel-shared.ts`, and `vercel.json` (verified via `git ls-files`). Running the advertised regenerate command silently deletes all of them and reverts `agent.ts` to the skeleton.

Fix: exclude customized agents from `--clean` (skip a dir containing a `.generated=false` marker or any file outside the known generated set), or generate into a staging dir and diff/merge rather than `rmSync` the whole tree. Minimal version: have `--clean` remove only the files `writeAgent` is about to write, not the directory.

Acceptance: `npm run generate:catalog` followed by `git status` shows no deletions under `agents/catalog/06-incident-commander/agent/channels/alert.ts` (or any of the 11 files); `verify-catalog` still passes.

Tag: CODE.

## Coupling

### COUP-001 (P2): tool state is bound to launch CWD via relative reads/writes

Evidence: `packages/agent-kit/tools.js:8-16` resolves all data through `process.cwd()`: `load_dossier` reads `agent/data/dossier.json` (`:50`), `search_records`/`analyze_records` read `agent/data/records.json` (`:63`,`:75`), and `agentSlug()` reads `package.json` name (`:19-21`). Behavior is correct only when the process is launched from the agent package root. Combined with REL-001 (writes under cwd) this makes the shared tool module silently environment-dependent: the same tool returns `{}` / `[]` fallbacks if cwd is the monorepo root or a serverless task dir.

Fix: resolve the agent root explicitly (eve exposes `runtimeContext.appRoot`, used in `superserve-backend/index.js:68`; `EVE_APP_ROOT` is honored in `openrouter/load-env.js:11`) and base `readJson`/artifact paths on it rather than bare `process.cwd()`.

Acceptance: running a catalog agent's tools with `cwd` set to the monorepo root still loads that agent's dossier/records (a test invokes `loadDossierTool.execute` from a non-package cwd and gets the real dossier).

Tag: CODE.

### COUP-002 (P3): scaffold template has drifted from the actual production pattern

Evidence: `scripts/scaffold-production-agent.sh:73-81` scaffolds `agent.ts` with `orModel()` (lab-only, OpenRouter) and its `package.json` (`:38-46`) omits `@eve-catalog/profile`. The real production agents use the dual-track resolver: `agents/production/p06-sql-analyst/agent/agent.ts:2,5` imports `resolveModel` from `@eve-catalog/profile` and lists it as a dependency (`p06.../package.json:21`). New scaffolds are therefore Vercel-incapable by default and inconsistent with shipped agents.

Fix: update the scaffold heredocs to emit `resolveModel()` from `@eve-catalog/profile` and add the dependency, matching `p06`.

Acceptance: a freshly scaffolded agent passes `verify-runtime`-style checks (uses `resolveModel`, depends on `@eve-catalog/profile`) and builds with `VERCEL=1`.

Tag: CODE.

### COUP-003 (P3): sandbox command builder concatenates args unquoted into a shell string

Evidence: `packages/superserve-backend/session.js:19-37` (`toCommand`) joins `options.command`/`args` with spaces and passes the result to `sandbox.commands.run(command)` (`:42`). Args containing spaces or shell metacharacters are reinterpreted by the VM shell. Impact is contained because execution is already inside an isolated SuperServe microVM (not a privilege boundary the agent didn't already have), so this is correctness/robustness, not escalation. Note `removePath` (`:137-143`) does correctly single-quote and escape its target.

Fix: where a structured arg vector is available, pass it through without flattening, or shell-quote each arg (reuse the escaping idiom already at `session.js:142`).

Acceptance: a `run({command:["echo", "a b; c"]})` test observes the literal argument rather than a split/extra command.

Tag: CODE.

## Dependency hygiene

### DEP-001 (P2): the entire toolchain is pinned to pre-release and dated dev builds

Evidence: lockfile/`package.json` pins `eve@0.11.4` (pre-1.0; `package.json` uses `^0.11.4` which for 0.x still admits 0.11.x patch drift on `npm install`), `ai@7.0.0-beta.178` (root `overrides`, `package.json:overrides`), `@ai-sdk/openai-compatible@3.0.0-beta.57` (54 installs in lockfile), and devDependency `@typescript/native-preview@7.0.0-dev.20260523.1` (`generate-catalog.mjs:112`, `scaffold-production-agent.sh:49`), which is the `tsgo` typecheck binary for every workspace (`package.json` scripts use `tsgo`). A dated `-dev` preview can be unpublished from npm at any time; if it is, `npm ci` fails repo-wide and CI `typecheck` (`ci.yml:39`) and all per-agent `typecheck` break with no fallback.

Fix: vendor or mirror the `@typescript/native-preview` build (or pin a published `typescript` fallback for `tsgo`), and add a renovate/dependabot or a scheduled CI job that fails loudly when a pinned pre-release is no longer resolvable, so the bus-factor surfaces before a release does.

Acceptance: a CI job runs `npm ci` against a clean cache and `npx tsgo --version` resolves; removing the dev-preview from the cache triggers a documented fallback rather than a hard failure.

Tag: CODE+OPS.

### DEP-002 (P3): `setup.sh` uses `npm install` while CI/deploy use `npm ci`

Evidence: `scripts/setup.sh:34` runs `npm install` (can rewrite `package-lock.json` and pull newer 0.11.x eve), whereas `ci.yml:21,36` and `deploy-catalog.sh:18` use `npm ci` (lockfile-exact). Local and CI dependency trees can diverge.

Fix: use `npm ci` in `setup.sh` (it already requires a committed lockfile, which exists at 216 KB).

Acceptance: `setup.sh` leaves `package-lock.json` unchanged (`git diff --exit-code package-lock.json` after setup).

Tag: CODE.

## Operational blind spots

### OPS-001 (P2): no secret scanning in CI; the run.log leak slipped past

Evidence: `.github/workflows/ci.yml` has `structure`, `typecheck`, eval, and deploy jobs but no secret-scan step. DATA-001 shows tracked traces that a gitleaks gate would have flagged. The `.gitignore:1-9` secret rules are good but unenforced.

Fix: add a `gitleaks` job to `ci.yml` (runs on PR and push) scanning the tree and git history; this also backstops SEC-005.

Acceptance: a PR introducing a fake `sk-`-style token fails CI on the gitleaks job; a clean tree passes.

Tag: CODE+OPS. (This reviewer ran a tracked-content secret scan over the repo, `git grep` for `sk-`/`Bearer`/`AKIA`/`ghp_`/`xox`/PEM headers and inline key assignments, excluding `package-lock.json`, and found no live key material, so the immediate exposure is repo bloat and trace leakage, not a committed credential.)

### OPS-002 (P3): root package is publishable

Evidence: root `package.json:"private": false` with `"license":"MIT"` and `workspaces`. A stray `npm publish` at the root would attempt to publish the monorepo root (the workspace members are individually `private:true`, so the risk is the root metadata package, not the agents).

Fix: set the root `package.json` to `"private": true` (it is a workspace root, not a published library).

Acceptance: `npm publish --dry-run` at the root refuses with the private-package error.

Tag: CODE.

## Dependency-ordered remediation plan

Ordering reflects what unblocks or de-risks subsequent work, not just severity.

FOUNDATION (land first; makes everything else verifiable and safe to iterate on):
- DATA-001 untrack the 25 MB of logs, and OPS-001 add the gitleaks CI gate in the same PR (the gate guards the cleanup from regressing). Touches `.gitignore`, `ci.yml`, and a bulk `git rm --cached`.
- DEP-001 stabilize the typecheck toolchain so CI is reliable while later fixes are validated. Touches `package.json`, `ci.yml`.

WAVE 1 (P0/P1; functional and security breaks on the deployed flagship):
- SEC-001 authenticate `/incident` (`alert.ts`).
- REL-001 route tool writes through a writable artifacts root (`agent-kit/tools.js`).
- COST-001 make the Monid budget reserve/release atomic and (optionally) durable (`monid-tools/index.js`).
- DATA-002 stop `generate:catalog --clean` from deleting flagship source (`generate-catalog.mjs`).
  Sequencing note: COST-002 and COST-003 build on COST-001 (same module), so land COST-001 first.

WAVE 2 (P2 hardening):
- SEC-002 SSRF allowlist, SEC-003 production channel auth, COST-002 setup budget defaults, COST-003 ledger path, REL-002 stream failure exit code, REL-003 sandbox reclaim, COUP-001 cwd-independent tool state.
  Sequencing note: SEC-003 reuses the renamed `routeAuth()` helper; do it after SEC-001 settles the auth pattern.

WAVE 3 (P3 polish):
- SEC-004, SEC-005 (after OPS-001), REL-004, COUP-002, COUP-003, DEP-002, OPS-002.

## Hot-file collision map

Files touched by more than one finding; coordinate edits to avoid churn and merge conflicts.

| File                                                              | Findings                          | Coordinate as                                                            |
|-------------------------------------------------------------------|-----------------------------------|--------------------------------------------------------------------------|
| `packages/agent-kit/tools.js`                                     | REL-001, SEC-002, COUP-001        | One refactor: add `artifactsRoot()` + `appRoot()` via `EVE_APP_ROOT`, plus fetch allowlist |
| `packages/monid-tools/index.js`                                   | COST-001, COST-003                | One pass over `run()`/`logCost`: atomic reserve/release + tmpdir ledger  |
| `scripts/setup.sh`                                                | COST-002, SEC-005, DEP-002        | Single edit: budget defaults, stop `.env.local` fan-out, `npm ci`        |
| `scripts/lib.sh` (`start_eve_dev`, `ensure_env_local`)            | REL-003, SEC-005                  | Gate `rm -rf .eve`; drop per-dir secret copy                             |
| `scripts/generate-catalog.mjs`                                    | DATA-002, COUP-001 (template)     | Make `--clean` non-destructive to hand-authored files                    |
| `.github/workflows/ci.yml`                                        | OPS-001, DEP-001, SEC-003 (accept)| Add gitleaks + toolchain-resolvability + prod-auth smoke jobs            |
| `.gitignore` + bulk `git rm --cached`                             | DATA-001                          | Untrack logs/evidence in one commit                                      |
| `packages/agent-kit/route-auth.js`                                | SEC-001, SEC-003                  | Rename `catalogRouteAuth` to neutral `routeAuth`; reuse for webhook+prod |
| `scripts/scaffold-production-agent.sh`                            | SEC-003, COUP-002                 | Emit `resolveModel` + `@eve-catalog/profile` + `channels/eve.ts`         |
| `agents/catalog/06-incident-commander/agent/channels/alert.ts`    | SEC-001                           | Add secret check before `send()`                                         |

## Validated strengths (do not touch)

These are correct and load-bearing; changes here add risk without benefit.

- HITL approval gate. `needsApproval: always()` on `record_decision` (`agent-kit/tools.js:123`) and `refund_charge` (`integrations/08-hitl/agent/tools/refund_charge.ts:12`) is the right mandatory-approval pattern, proven end-to-end by `scripts/eval-catalog-hitl.sh:59-67` and `scripts/hitl_test.sh`. Keep the gate; only the artifact write path (REL-001) needs fixing.
- Dual-track resolution. `packages/profile/index.js:10-64` switches model and sandbox by environment with clean guards (`isVercelRuntime`, `shouldUseSuperserve`) and no leakage between tracks. This is the cleanest abstraction in the repo.
- Budget guard concept. The pre-call cap and cost estimate in `monid-tools/index.js:99-120` are the right shape; COST-001 fixes the race/durability without discarding the design.
- Safe-by-default external fetch. `fetch_live_json` is disabled unless `ALLOW_EXTERNAL_FETCH=1` and enforces https-only (`agent-kit/tools.js:141-150`). Keep the default-off posture; SEC-002 only adds an allowlist on top.
- Keyless structure verification. `verify-catalog.mjs`, `verify-runtime.mjs`, `verify-evals.mjs` (run by `test-all.mjs`) give a fast, deterministic CI gate that caught real drift checks (legacy `@lab/*` deps, `arch-` naming, dual-track snippets). Strong foundation; build the gitleaks gate alongside it.
- SuperServe session wrapper. `packages/superserve-backend/session.js` maps `404 -> null` consistently (`:86-88`, `:96-98`, `:110-112`), bridges streaming correctly, and shell-escapes `removePath` (`:142`). Keep; only the dispose/quota policy (REL-003) is the issue, not the wrapper.
- Request-time key resolution. `packages/openrouter/load-env.js:44-52` resolves the OpenRouter key per request and walks up for `.env.local`/`.secrets/eve.env`, which is what makes workflow workers without dotenv work. This same upward walk is the basis for the SEC-005 fix.
- Swarm isolation and cleanup. `swarm_run` bounds jobs to 6, isolates each in its own VM, and always `sandbox.kill()` in `finally` (`agent-kit/tools.js:165-209`). This is the correct fan-out-with-cleanup pattern.
- Comprehensive secret gitignore. `.gitignore:1-9` covers `.env*`, `.secrets/`, `*.key`, `*.pem`. The rules are right; DATA-001 is only about already-tracked files, not the rules.
