# RESEARCH — Vercel **eve**, SuperServe, Monid

> Research log for building a tested catalog of agents on Vercel's `eve` framework, wired to
> OpenRouter (inference), SuperServe (sandbox), and Monid (tool router).
> Date of research: 2026-06-18. **eve is public beta** (released 2026-06-17) — APIs may churn.

## Sources
- eve announcement — https://vercel.com/blog/introducing-eve
- eve changelog — https://vercel.com/changelog/introducing-eve-an-open-source-agent-framework
- eve docs — https://vercel.com/docs/eve and `.../docs/eve/concepts`
- eve repo — https://github.com/vercel/eve
- eve bundled docs — `node_modules/eve/docs/**` (read directly from the published package)
- SuperServe — https://docs.superserve.ai (`/introduction`, `/quickstart`, `/sandbox/create`, `/sdk-reference/sandbox`, `/llms.txt`)
- Monid — https://docs.monid.ai (`/`, `/api/overview.html`, `/api/discover.html`, `/guide/quickstart-mcp.html`)

## Version pins (exact, as used by this lab)
| Component | Version | Notes |
|-----------|---------|-------|
| `eve` | `0.11.4` | Filesystem-first durable-agent framework. Apache-2.0. Public beta. |
| `ai` (AI SDK) | `7.0.0-beta.178` | eve **peer-pins** this. AI SDK **v7 beta**. |
| `zod` | `^3.25 \|\| ^4` | tool/input schemas |
| `@superserve/sdk` | `0.7.4` | TS SDK; Python pkg `superserve` (PyPI). |
| `@openrouter/ai-sdk-provider` | `2.9.1` | peer `ai: ^6` → **mismatch with eve's v7** (see friction). |
| `@ai-sdk/openai-compatible` | `2.0.51` | fallback provider path |
| Node | `>= 24` | eve `engines`. (Lab host installs `v24.17.0` via nvm.) |

> **Beta/churn note:** because `eve` shipped one day before this research, pin every version and
> commit the lockfile. The `ai@7.0.0-beta.178` peer is the single most important pin — it drives
> which model-provider package is compatible (see "OpenRouter integration").

---

## eve mental model

An eve agent is **a directory of files under `agent/`**. eve discovers files by name, validates them,
compiles a manifest, and serves a deployable app. Adding a capability = adding a file.

| Path | Defines | Helper |
|------|---------|--------|
| `agent/instructions.md` (or `.ts`) | always-on system prompt (required) | — |
| `agent/agent.ts` | runtime config (model, compaction, …) | `defineAgent` (from `eve`) |
| `agent/tools/*.ts` | one typed tool per file; filename = tool name (snake_case) | `defineTool` (from `eve/tools`) |
| `agent/skills/*` | on-demand markdown procedures (seeded to `/workspace/skills/`) | — |
| `agent/channels/*` | entry points (HTTP, Slack, Discord, GitHub, Linear, Twilio, Telegram, Teams) | `eveChannel`, `*Channel` (from `eve/channels/*`) |
| `agent/connections/*` | external MCP / OpenAPI integrations | `defineMcpClientConnection`, `defineOpenAPIConnection` (from `eve/connections`) |
| `agent/sandbox/sandbox.ts` (or `agent/sandbox.ts`) | the agent's isolated compute env | `defineSandbox` (from `eve/sandbox`) |
| `agent/sandbox/workspace/**` | files seeded into `/workspace` at session start | — |
| `agent/schedules/*.ts\|.md` | recurring cron jobs (root-only) | `defineSchedule` (from `eve/schedules`) |
| `agent/subagents/<id>/` | declared specialist child agents | `defineAgent` (with required `description`) |
| `agent/hooks/`, `agent/instrumentation.ts` | lifecycle hooks, OpenTelemetry | — |
| `evals/*.eval.ts` + `evals/evals.config.ts` | scored test suites (app root, **not** under `agent/`) | `defineEval`, `defineEvalConfig` (from `eve/evals`) |

If `agent.ts` is omitted, eve defaults to `anthropic/claude-sonnet-4.6`. If present, `model` is required.

### `defineAgent` fields
`model` (gateway id string **or** an AI-SDK `LanguageModel`), `modelOptions`, `compaction:{thresholdPercent}`,
`experimental:{codeMode}` (route tools through a sandboxed JS wrapper), `outputSchema` (task-mode structured output),
`build:{externalDependencies}`.

### Default harness (built-in tools, no authoring)
`bash`, `read_file`, `write_file`, `glob`, `grep` (all target the sandbox, cwd `/workspace`),
plus web/delegation tools, the built-in `agent` (self-copy subagent) and `ask_question` (HITL question).

### Tools vs sandbox (trust boundary)
Authored tools run in the **app runtime** with full `process.env` (good place for API keys).
Only the sandbox tools and `ctx.getSandbox()` calls run **inside the sandbox** (no host secrets).

## Sessions, durable execution & the Workflow SDK
- **session** = durable conversation/task (lives for days/weeks). **turn** = one user message + all work it triggers. **step** = a durable checkpoint (one model call + its tool calls).
- Every turn is a durable workflow on the open-source Workflow SDK (Vercel Workflow when deployed). eve checkpoints at each step; on crash/redeploy it resumes from the last completed step (completed steps never re-run; an interrupted step re-runs → make side effects idempotent or gate with approval).
- Turns **park** durably (zero compute) on approvals, interactive OAuth, and subagents, then resume exactly where they left off.
- `continuationToken` is a **resume handle**, not a durable message queue. Send one user turn at a time; wait for `session.waiting` before the next.

## HTTP API (the default `eve` channel, always mounted)
- `GET /eve/v1/health`
- `POST /eve/v1/session` — body `{ "message": "..." }` → `{ continuationToken, ok, sessionId }` + header `x-eve-session-id`
- `POST /eve/v1/session/:sessionId` — body `{ continuationToken, message }` (follow-up)
- `GET /eve/v1/session/:sessionId/stream` — **NDJSON** (`application/x-ndjson; charset=utf-8`), one event/line
- Dev-only: `POST /eve/v1/dev/schedules/:scheduleId` — fire a schedule once (since `eve dev` never runs crons on cadence)

**Stream event catalog:** `session.started`, `turn.started`, `actions.requested`, `action.result`,
`reasoning.appended`/`reasoning.completed`, `message.appended`/`message.completed`, `input.requested`,
`authorization.required`/`authorization.completed`, `turn.failed`, `session.waiting`, `session.completed`,
`subagent.called`/`subagent.completed`.

## CLI (`eve`)
`init [target] [--channel-web-nextjs]`, `info [--json]`, `build`, `start [--host --port]`,
`dev [url] [--no-ui --port --logs ...]`, `link`, `deploy`, `eval [ids] [--url --strict --json --junit --list --tag]`,
`channels add [slack|web]`, `channels list`. Loads `.env`/`.env.local` from app root. `eve dev` writes pid to `.eve/dev-process.pid` (one dev server per agent).

## Eval system
`evals/*.eval.ts` files (path = id) + one `evals/evals.config.ts`. `defineEval({ description, test(t), judge, tags, timeoutMs })`.
- Drive: `t.send`, `t.respond`, `t.respondAll`, `t.sendFile`, `t.expectInputRequests`, `t.newSession`; read `t.reply`, `t.sessionId`, `t.events`.
- Assert: run-level `t.completed()`, `t.calledTool()`, `t.usedNoTools()`, `t.toolOrder([...])`; value `t.check(value, includes|equals|matches|similarity)` (from `eve/evals/expect`); judge `t.judge.autoevals.*` (uses configured judge model).
- Severity: **gates** (hard, fail → exit non-zero) vs **soft** (`.soft()/.atLeast()`); `.gate()` to promote.
- `eve eval` exit codes: `0` pass, `1` failure, `2` config error.

---

## OpenRouter integration (model provider swap)
**Clean hook:** `defineAgent({ model })` accepts a provider-authored `LanguageModel`, so we pass an
OpenRouter model instead of a Vercel AI Gateway id.

**Friction (documented):** eve peer-pins `ai@7.0.0-beta.178` (AI SDK v7 beta) but
`@openrouter/ai-sdk-provider@2.9.1` declares peer `ai: ^6`. The `LanguageModelV*` spec can differ
between v6 and v7, so the provider must produce a model matching eve's bundled `ai`. Resolution order
(decided at build time by `packages/openrouter`, with a standalone verification script):
1. an `@openrouter/ai-sdk-provider` release compatible with `ai@7`, else
2. `@ai-sdk/openai-compatible` `createOpenAICompatible({ baseURL: "https://openrouter.ai/api/v1", apiKey, name: "openrouter" })`, else
3. `@ai-sdk/openai` `createOpenAI({ baseURL, apiKey })`.

**Model choice:** OpenRouter **free** models (`:free`) are rate-limited upstream (observed HTTP 429).
Default to ultra-cheap paid models and fall back free→cheap:
`meta-llama/llama-3.1-8b-instruct` (~$0.02/M), `openai/gpt-oss-20b`, `qwen/qwen-2.5-7b-instruct`,
`mistralai/mistral-nemo`, `amazon/nova-micro-v1`. Escalate to a stronger model only when a task
demonstrably fails on cheap ones.

Auth check used: `GET https://openrouter.ai/api/v1/key` (Bearer). Key verified valid.

## SuperServe integration (sandbox backend)
**Clean hook:** eve's `SandboxBackend` is a public, pluggable interface (`eve/sandbox`).
Built-ins: `vercel()`, `docker()`, `microsandbox()`, `justbash()`, `defaultBackend()`.
**On this host Docker and KVM are absent**, so `docker()`/`microsandbox()` can't run and `vercel()`
needs a deploy — leaving only `just-bash` (no real binaries). A **custom SuperServe backend** is
therefore the only way to run real binaries locally.

`SandboxBackend = { name, prewarm(input)→{reused}, create(input)→SandboxBackendHandle }`.
`SandboxBackendHandle = { session: SandboxSession, useSessionFn, captureState()→{backendName, metadata, sessionKey}, dispose() }`.
`SandboxSession` surface to implement: `id`, `resolvePath`, `run`, `spawn`, `readFile`/`readBinaryFile`/`readTextFile`,
`writeFile`/`writeBinaryFile`/`writeTextFile`, `removePath`, `setNetworkPolicy`. (eve's internal
`buildSandboxSession(internal, setNetworkPolicy)` helper that derives this surface from a small
`InternalSandboxSession` is **not exported**, so we replicate it.)

SuperServe SDK mapping: `Sandbox.create({ name, timeoutSeconds, metadata, envVars, network })`,
`Sandbox.connect(id)`, `sandbox.commands.run(cmd)` (blocking → `run`), streaming exec (SSE/WebSocket → `spawn`),
`sandbox.files.write/read/readText` (→ file methods), `pause()/resume()/kill()`.
Persist the SuperServe sandbox id in `captureState().metadata` so `create` can `connect()`/resume the
same VM across turns/restarts (this powers the durable-resume archetype). REST auth header is `X-API-Key`
(base `https://api.superserve.ai`). Key verified valid.

## Monid integration (tool router)
**Primary (robust, budget-controlled):** authored tools `monid_discover`, `monid_inspect`, `monid_run`
calling the HTTP API with `Authorization: Bearer $MONID_API_KEY`:
- `POST /v1/discover` `{query, limit≤20}` → matching endpoints + `price{type:PER_CALL|PER_RESULT, amount, currency}`
- `POST /v1/inspect` → full schema/pricing
- `POST /v1/run` → execute (paid)
- `GET /v1/runs`, `GET /v1/runs/:id`, `GET /v1/wallet/balance`

`discover`/`inspect` appear free; `run` is **paid**. A budget guard refuses runs over a per-task cap
and logs each paid call's USD cost. Wallet balance verified ($495.34 at research time).

**Secondary:** `defineMcpClientConnection({ url: "https://mcp.monid.ai/v1" })` — docs imply OAuth login;
we attempt an API-key header and document whether it works.

---

## Environment constraints on this host
- Node was v22.14 → installed **v24.17.0** via nvm 0.40.3 (eve needs ≥24).
- **No Docker daemon, no `/dev/kvm`** → see SuperServe rationale above. glibc 2.39, Linux.
- API keys are provided via env (staged into a gitignored session file, never committed).
