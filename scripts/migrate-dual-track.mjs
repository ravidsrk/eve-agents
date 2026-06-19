#!/usr/bin/env node
/**
 * Apply dual-track runtime files to catalog agents (agent.ts, sandbox.ts, runtime.ts).
 * Idempotent — safe to re-run.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalogDir = path.join(root, "agents", "catalog");

const AGENT_TS = `import { defineAgent } from "eve";
import { DEFAULT_CONTEXT_WINDOW, resolveModel } from "@eve-agents/profile";

export default defineAgent({
  model: resolveModel(),
  modelContextWindowTokens: DEFAULT_CONTEXT_WINDOW,
});
`;

const SANDBOX_TS = `import { defineSandbox } from "eve/sandbox";
import { resolveSandboxDefinition } from "@eve-agents/profile";

export default defineSandbox(
  resolveSandboxDefinition({
    superserve: {
      fromTemplate: "superserve/python-ml",
      timeoutSeconds: 1800,
    },
  }),
);
`;

const RUNTIME_TS = `// Dual-track runtime: AI Gateway on Vercel, OpenRouter + SuperServe locally.
export {
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_VERCEL_MODEL,
  isVercelRuntime,
  resolveModel,
  resolveSandboxDefinition,
  resolveSuperserveBackend,
  shouldUseSuperserve,
} from "@eve-agents/profile";
`;

function updatePackageJson(file) {
  const pkg = JSON.parse(readFileSync(file, "utf8"));
  let changed = false;
  const map = {
    "@eve-agents/openrouter": "@eve-agents/openrouter",
    "@eve-agents/superserve-backend": "@eve-agents/superserve-backend",
    "@eve-agents/monid-tools": "@eve-agents/monid-tools",
    "@eve-agents/agent-kit": "@eve-agents/agent-kit",
    "@eve-agents/profile": "@eve-agents/profile",
  };
  if (pkg.dependencies) {
    for (const [oldName, newName] of Object.entries(map)) {
      if (pkg.dependencies[oldName]) {
        delete pkg.dependencies[oldName];
        pkg.dependencies[newName] = "*";
        changed = true;
      }
    }
    if (!pkg.dependencies["@eve-agents/profile"]) {
      pkg.dependencies["@eve-agents/profile"] = "*";
      changed = true;
    }
  }
  if (pkg.scripts && !pkg.scripts["test:evals"]) {
    pkg.scripts["test:evals"] = "eve eval --strict";
    changed = true;
  }
  if (changed) writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
  return changed;
}

function updateToolImports(dir) {
  const toolsDir = path.join(dir, "agent", "tools");
  if (!existsSync(toolsDir)) return 0;
  let n = 0;
  for (const file of readdirSync(toolsDir)) {
    if (!file.endsWith(".ts")) continue;
    const full = path.join(toolsDir, file);
    const text = readFileSync(full, "utf8");
    if (!text.includes("@eve-agents/agent-kit")) continue;
    writeFileSync(full, text.replaceAll("@eve-agents/agent-kit", "@eve-agents/agent-kit"));
    n += 1;
  }
  return n;
}

const dirs = readdirSync(catalogDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
  .map((e) => e.name)
  .sort();

let agents = 0;
for (const name of dirs) {
  const dir = path.join(catalogDir, name);
  writeFileSync(path.join(dir, "agent", "agent.ts"), AGENT_TS);
  writeFileSync(path.join(dir, "agent", "sandbox", "sandbox.ts"), SANDBOX_TS);
  writeFileSync(path.join(dir, "agent", "lib", "runtime.ts"), RUNTIME_TS);
  updatePackageJson(path.join(dir, "package.json"));
  updateToolImports(dir);
  agents += 1;
}

console.log(`migrated ${agents} catalog agents to dual-track runtime`);