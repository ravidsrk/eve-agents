# Shared packages (`@eve-catalog/*`)

Workspace libraries used by catalog, production, reference, and integration agents. Not published to npm — consumed via monorepo `workspaces`.

| Package | Path | Role |
| --- | --- | --- |
| **profile** | [profile/](profile/) | `resolveModel()`, `resolveSandboxDefinition()` — dual-track lab vs Vercel |
| **openrouter** | [openrouter/](openrouter/) | OpenRouter language model client + env loading |
| **superserve-backend** | [superserve-backend/](superserve-backend/) | SuperServe sandbox backend for lab track |
| **agent-kit** | [agent-kit/](agent-kit/) | Catalog tools (`load_dossier`, …) + `routeAuth()` |
| **monid-tools** | [monid-tools/](monid-tools/) | Budget-capped Monid discover/inspect/run client |

## profile

```js
import { resolveModel, resolveSandboxDefinition } from "@eve-catalog/profile";

export default defineAgent({
  model: resolveModel({ labModel: "openai/gpt-oss-120b" }),
  // ...
});

export default defineSandbox(
  resolveSandboxDefinition({
    superserve: { fromTemplate: "superserve/python-ml", timeoutSeconds: 1800 },
  }),
);
```

Ephemeral run scripts set `EVE_KILL_SANDBOX_ON_DISPOSE=1` so harness VMs are killed, not paused.

## agent-kit

Re-exported by every catalog agent's `agent/tools/*.ts`. Key behaviors:

- **Reads** resolve `EVE_APP_ROOT` or walk up to the agent package
- **Writes** use `artifactsRoot()` (`EVE_ARTIFACTS_DIR` or tmpdir on Vercel)
- **`fetch_live_json`** off unless `ALLOW_EXTERNAL_FETCH=1`; then HTTPS + `FETCH_ALLOW_HOSTS` allowlist

```js
import { routeAuth } from "@eve-catalog/agent-kit/route-auth";
// catalogRouteAuth() is a deprecated alias
```

## monid-tools

Used by production agents p01–p10 for paid external tool calls.

| Env | Default | Purpose |
| --- | --- | --- |
| `MONID_BUDGET_USD` | `5` | Per-process spend cap |
| `MONID_MAX_CALL_USD` | `0.25` | Single-call ceiling |
| `MONID_COST_LOG` | `<tmpdir>/monid-costs.jsonl` | JSONL ledger |

`run()` serializes concurrent calls and reserves budget before the network request.

## Tests

```bash
npm run test -w @eve-catalog/profile
npm run test -w @eve-catalog/agent-kit
npm run test -w @eve-catalog/monid-tools
```

All are included in `npm run test:structure` via `scripts/test-all.mjs`.