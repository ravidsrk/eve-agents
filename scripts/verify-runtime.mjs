#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalogDir = path.join(root, "agents", "catalog");

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

const requiredSnippets = {
  "agent/agent.ts": ["resolveModel", "@eve-agents/profile"],
  "agent/sandbox/sandbox.ts": ["resolveSandboxDefinition", "@eve-agents/profile"],
  "agent/lib/runtime.ts": ["@eve-agents/profile"],
};

const dirs = readdirSync(catalogDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
  .map((e) => e.name)
  .sort();

if (dirs.length !== 50) fail(`expected 50 catalog agents, found ${dirs.length}`);

for (const dir of dirs) {
  const full = path.join(catalogDir, dir);
  for (const [rel, snippets] of Object.entries(requiredSnippets)) {
    const file = path.join(full, rel);
    if (!existsSync(file)) fail(`${dir} missing ${rel}`);
    const text = readFileSync(file, "utf8");
    for (const snippet of snippets) {
      if (!text.includes(snippet)) fail(`${dir} ${rel} missing "${snippet}"`);
    }
  }

  const pkg = JSON.parse(readFileSync(path.join(full, "package.json"), "utf8"));
  if (!pkg.dependencies?.["@eve-agents/profile"]) {
    fail(`${dir} missing @eve-agents/profile dependency`);
  }
  if (pkg.dependencies?.["@lab/openrouter"] || pkg.dependencies?.["@lab/profile"]) {
    fail(`${dir} still depends on legacy @lab/* package`);
  }
  const agentTs = readFileSync(path.join(full, "agent", "agent.ts"), "utf8");
  if (agentTs.includes("orModel(") || agentTs.includes("@eve-agents/openrouter")) {
    fail(`${dir} agent.ts must use resolveModel from @eve-agents/profile only`);
  }
}

if (!process.exitCode) {
  console.log(`PASS: verified dual-track runtime on ${dirs.length} catalog agents`);
}