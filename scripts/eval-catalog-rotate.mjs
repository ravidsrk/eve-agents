#!/usr/bin/env node
/**
 * Run smoke-dossier eval on a rotating subset of catalog agents (bounded CI time).
 * Usage: node scripts/eval-catalog-rotate.mjs [count=10] [seed=0]
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalogDir = path.join(root, "agents", "catalog");
const count = Number(process.argv[2] ?? 10);
const seed = Number(process.argv[3] ?? 0);

const dirs = readdirSync(catalogDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
  .map((e) => e.name)
  .sort();

function pick(list, n, s) {
  const out = [];
  let i = s % list.length;
  while (out.length < Math.min(n, list.length)) {
    if (!out.includes(list[i])) out.push(list[i]);
    i = (i + 1) % list.length;
  }
  return out;
}

const selected = pick(dirs, count, seed);
let pass = 0;
let fail = 0;

for (const dir of selected) {
  const agentDir = path.join(catalogDir, dir);
  const evalFile = path.join(agentDir, "evals", "smoke-dossier.eval.ts");
  if (!existsSync(evalFile)) {
    console.log(`SKIP ${dir} (no smoke-dossier)`);
    continue;
  }
  console.log(`\n==> ${dir}`);
  try {
    execSync("npx eve eval --strict evals/smoke-dossier.eval.ts", {
      cwd: agentDir,
      stdio: "inherit",
      env: process.env,
    });
    pass += 1;
  } catch {
    fail += 1;
    console.error(`FAIL ${dir}`);
  }
}

console.log(`\nRotate evals: ${pass} passed, ${fail} failed (${selected.length} selected)`);
process.exit(fail > 0 ? 1 : 0);