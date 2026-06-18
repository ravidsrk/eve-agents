# Research notes

Date: 2026-06-18

## Purpose

This repository now targets a catalog of real-world eve agents, not a feature checklist. The research
baseline is: what agent shapes Vercel publicly recommends, which production workflows are plausible,
and where OpenRouter, SuperServe, and Monid fit without pretending unverified live runs happened.

## eve

Primary sources:

- Vercel announcement: <https://vercel.com/blog/introducing-eve>
- Vercel docs: <https://vercel.com/docs/eve>
- eve GitHub repository: <https://github.com/vercel/eve>

Current mental model:

- eve is a filesystem-first framework for durable backend agents.
- An agent is authored under `agent/`.
- Common files:
  - `agent/agent.ts` for model/runtime config.
  - `agent/instructions.md` for the always-on prompt.
  - `agent/tools/*.ts` for typed tools.
  - `agent/skills/*` for load-on-demand procedures.
  - `agent/channels/*` for Slack/Discord/Teams/Telegram/Twilio/GitHub/Linear style entry points.
  - `agent/connections/*` for MCP or OpenAPI services.
  - `agent/sandbox/*` for isolated code/file execution.
  - `agent/schedules/*` for cron-like work.
  - `agent/subagents/*` for delegated specialists.
  - `evals/*.eval.ts` for scored tests.
- Sessions are durable workflows. Model/tool steps are checkpointed so a session can pause on approval
  or interruption and resume later.
- The default HTTP surface is useful for verification:
  - `POST /eve/v1/session`
  - `POST /eve/v1/session/:sessionId`
  - `GET /eve/v1/session/:sessionId/stream`

The Vercel announcement also names production-style internal agent classes: data analyst, autonomous
SDR, sales cockpit, support engineer, content agent, and routing agent. Those informed the first
columns of [AGENT_MATRIX.md](AGENT_MATRIX.md).

## Vercel templates

Sources:

- Content agent template: <https://github.com/vercel-labs/eve-content-agent-template>
- Personal agent template: <https://github.com/vercel-labs/personal-agent-template>
- Slack starter: <https://github.com/vercel-labs/eve-slack-agent-template>
- PR triage template: <https://github.com/vercel-labs/eve-pr-triage-agent-template>

Useful patterns:

- Use a real user surface, commonly Slack or web, instead of only CLI demos.
- Use approvals for side effects.
- Keep domain rules in editable skills.
- Keep grounded source material separate from model reasoning.
- Prefer deployable, durable workflows over one-shot chat.
- PR/support/content agents are stronger examples than generic weather/tool demos.

## OpenRouter

The repo keeps `@lab/openrouter`, which uses `@ai-sdk/openai-compatible` against OpenRouter's
OpenAI-compatible endpoint.

Reason:

- eve currently peers against AI SDK v7 beta.
- The OpenRouter-branded AI SDK provider still peers against AI SDK v6, so the OpenAI-compatible
  provider path remains the safer integration.

Current blocker:

- `OPENROUTER_API_KEY` is not present in this workspace, so live model sessions were not rerun in
  the rebuild.

## SuperServe

Sources:

- SuperServe site: <https://superserve.ai>
- Existing local package: `packages/superserve-backend`

Role in this repo:

- SuperServe is the remote sandbox backend for eve file/code execution.
- Each generated archetype includes `agent/sandbox/sandbox.ts` using `@lab/superserve-backend`.
- This keeps the architecture aligned with durable, isolated, stateful agent work.

Current blocker:

- `SUPERSERVE_API_KEY` is not present in this workspace, so live sandbox sessions were not rerun in
  the rebuild.

## Monid

Role intended by the original prompt:

- Use Monid as a live tool router for external research.
- Use discover/inspect/run with cost logging.

Current blocker:

- `MONID_API_KEY` is present in the environment, but `POST https://api.monid.ai/v1/discover` returned
  `401 Invalid API key` during this rebuild.
- The 50-agent catalog therefore includes Monid integration notes and optional live hooks, but does
  not claim live Monid-backed research results.

## Agent selection rationale

The 50 agents were selected from workflows where durable sessions, sandboxed work, approvals, and
structured evidence are valuable:

- Operations that wait on humans: refunds, access requests, procurement, legal, compliance.
- Operations that need sandboxed compute: analytics, ETL quality, code interpreter, test debugging.
- Operations that need grounded source material: support, RAG, docs QA, contract review, literature
  mapping.
- Operations that benefit from scheduled or recurring execution: market brief, incident/on-call,
  data quality, cloud cost.
- Operations that should use channels later: support, content, PR triage, employee helpdesk, fleet
  router.

See [AGENT_MATRIX.md](AGENT_MATRIX.md) for the complete list and acceptance bar.
