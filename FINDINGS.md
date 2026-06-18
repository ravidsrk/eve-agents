# FINDINGS

An honest assessment of Vercel **eve** (`0.11.4`, public beta) after building and live-testing 22
agent archetypes, two eval suites, and a robustness suite — wired to OpenRouter, SuperServe, and Monid.

## TL;DR
eve is a genuinely well-designed framework. The "an agent is a directory of files" contract is the
real thing: capabilities are discoverable files, durability is free, and the same app runs locally and
deploys to Vercel unchanged. The pluggable model and sandbox interfaces meant **both** of our biggest
swaps — OpenRouter for inference and SuperServe for compute — were *documented extension points, not
hacks*. The sharp edges are mostly beta-version friction and a few thin spots in the docs, not design
flaws.

## What eve does well
- **The filesystem contract is excellent.** `agent/{instructions.md,agent.ts,tools/*,skills/*,channels/*,connections/*,sandbox/*,schedules/*,subagents/*}` is intuitive; `eve info` shows exactly what was discovered. Adding a capability is genuinely "add a file."
- **Durability is real and free.** Sessions survived a **full process kill + restart** (archetype 11) with zero durability code — the workflow state and our reconnect metadata both persisted to disk, and the session resumed via its `continuationToken`. This is eve's standout feature.
- **HITL is first-class.** `needsApproval` + the `input.requested`/`inputResponses` protocol made a refund-approval pause/resume trivial (archetype 08), durable across the wait.
- **Pluggable model.** `defineAgent({ model })` takes any AI-SDK `LanguageModel`, so OpenRouter dropped in cleanly.
- **Pluggable sandbox.** `SandboxBackend` is a small, public interface; we implemented SuperServe against it and every default tool (`bash`, `read_file`, …) "just worked," including streaming `spawn`.
- **Connections.** `defineMcpClientConnection` and `defineOpenAPIConnection` turned a remote MCP server (Monid) and a live REST API (Frankfurter) into model tools with credential brokering, in a few lines.
- **Evals are pragmatic.** `defineEval` drives the real HTTP surface; run-level assertions (`completed`, `calledTool`, `toolOrder`) + `t.check` matchers caught a real bug (case-sensitive `includes`) immediately.
- **Streaming is clean.** The NDJSON event model (`actions.requested`, `action.result`, `message.appended`, `message.completed`, `session.waiting`, …) was easy to drive from curl and a 120-line browser UI.

## Sharp edges (and how we handled them)
1. **AI SDK v6↔v7 provider churn.** eve pins `ai@7.0.0-beta.178` (provider spec **v4**). The OpenRouter-branded `@openrouter/ai-sdk-provider` targets the older v6 spec, so it does **not** drop in. We used the version-matched `@ai-sdk/openai-compatible@3.0.0-beta.*` pointed at OpenRouter (`specificationVersion: v4`, verified with a live `generateText`). *Pin everything; verify the provider against eve's bundled `ai` before wiring `agent.ts`.*
2. **Custom models break compaction unless you supply the context window.** With a non-gateway `LanguageModel`, eve can't look up the context size and `eve info` fails: *"does not have known AI Gateway context window metadata."* Fix: `defineAgent({ modelContextWindowTokens: 131072 })`. Easy once you know it; not obvious from the error.
3. **Local sandbox backends need Docker or KVM.** On a host with neither, `docker()` and `microsandbox()` can't run and `vercel()` needs a deploy — leaving only `just-bash` (no real binaries). This is exactly why a real remote backend (SuperServe) was worth building; it's also the cleanest demonstration of *why* the `SandboxBackend` interface matters.
4. **`prewarm` (build) and `create` (runtime) run in separate processes.** eve's seed-file mechanism assumes the backend bakes seeds into a reusable template at build time. SuperServe's TS SDK (0.7.4) has no snapshot-create-from-files, and an in-memory map doesn't survive the process split, so we **persist seed files to disk** (keyed by `templateKey`, under the shared `appRoot`) in `prewarm` and replay them on first `create`. Works; `bootstrap(...)` *functions* still can't cross that boundary (use seed files or `onSession`).
5. **Scoped workspace names confuse `eve eval`.** A package named `@arch/06-multi-tool` is reported by the running agent as `06-multi-tool`, but the eval runner expects the package name verbatim → "Expected eval target … but … is responding." All archetypes now use unscoped `arch-XX-name` package names.
6. **Schedules never fire on cadence under `eve dev`.** Expected, but you must use the dev dispatch route (`POST /eve/v1/dev/schedules/:id`) to test them locally.
7. **Sessions are not an ordered message queue.** The docs are explicit: `continuationToken` is a resume handle, not a FIFO. Send one turn at a time and wait for `session.waiting`.
8. **Small models are too weak for multi-step tool use.** `llama-3.1-8b` guessed column names and asked clarifying questions instead of acting; `gpt-oss-120b` was the cheapest model that reliably did multi-step tool calls (and even it occasionally leaks a tool call into reasoning text — mitigated by asking for one combined command).
9. **One dev server per agent**, with a pid lock (`.eve/dev-process.pid`). Kill the *server* pid, not just the `npx` wrapper, or the next boot is blocked.

## Integration story (clean vs hacky)
- **OpenRouter — clean.** `model: orModel()` from `@lab/openrouter`. The only friction is choosing the provider package that matches eve's `ai` beta (documented above). No patching of eve.
- **SuperServe — clean backend, one documented workaround.** `@lab/superserve-backend` implements the public `SandboxBackend` and rebuilds eve's `SandboxSession` surface over the SuperServe SDK (`commands.run`/`spawn`, `files.*`, `pause`/`connect`). `run` maps to the reliable blocking exec; `spawn` bridges streaming exec to AI-SDK process streams. Durable resume works by stashing the sandbox id in `captureState()` and `Sandbox.connect`-ing on the next `create`. The only non-obvious part is **seed-file persistence across the prewarm/create process split** (sharp edge #4). System templates (`python-ml`, `node-22`, …) boot in <1.5s with batteries included; network policy maps to SuperServe egress rules (deny-all verified).
- **Monid — clean, two ways.** Authored tools (`@lab/monid-tools`) wrap the HTTP API with a **USD budget guard** and a cost ledger (`.monid-costs.jsonl`) — use this when you need enforced spend caps (archetypes 02, 17). The remote **MCP** server also works via `defineMcpClientConnection` with a Bearer token (archetype 12), but that path is driven by eve directly and **bypasses our budget guard**, so restrict MCP agents to the free `discover`/`inspect` tools.

## Recommendation — what eve is genuinely good for
eve is a strong fit for **durable, long-running, tool-using backend agents** — anything that waits on
people (approvals), calls slow systems, runs code in a sandbox, or must survive deploys/restarts:
support/ops agents, data/analytics agents, coding agents, and scheduled workers. The durable-execution
core + HITL + sandbox + connections are exactly the production scaffolding teams otherwise rebuild, and
the deploy-to-Vercel story is frictionless.

It is **less compelling** today for: latency-critical single-shot chat (the durability machinery is
overhead you don't need), heavy multimodal pipelines (image input wasn't a smooth path in this beta),
and anyone who wants to stay off Vercel for hosting (the local non-Vercel sandbox story is thin without
a remote backend like the SuperServe one built here).

Net: for backend agents, eve removes a large amount of undifferentiated plumbing with a clean,
inspectable file contract. Treat the beta version pins seriously, supply `modelContextWindowTokens`
when you bring your own model, and bring a real sandbox backend if you're not on Vercel — then it's a
pleasure to build on.

## Rough cost of this exploration
- OpenRouter: tens of agent turns on `gpt-oss-120b` — well under $1 total.
- Monid: 3 paid `exa/search` calls — **~$0.033** (budget-guarded; wallet went $495.34 → ~$495.31).
- SuperServe: dozens of short-lived microVMs, paused/killed after use.
