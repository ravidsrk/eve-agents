#!/usr/bin/env node
/**
 * Run all keyless CI checks (structure + profile unit tests).
 * Live evals require API keys — use npm run eval:flagship.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const steps = [
  { name: "verify:catalog", command: "node", args: ["scripts/verify-catalog.mjs"] },
  { name: "verify:runtime", command: "node", args: ["scripts/verify-runtime.mjs"] },
  { name: "verify:evals", command: "node", args: ["scripts/verify-evals.mjs"] },
  { name: "test:profile", command: "npm", args: ["run", "test:profile"] },
];

let failed = 0;
for (const step of steps) {
  const result = spawnSync(step.command, step.args, { stdio: "inherit", cwd: root });
  if (result.status !== 0) {
    console.error(`\n✗ ${step.name} failed (exit ${result.status ?? 1})`);
    failed += 1;
  } else {
    console.log(`\n✓ ${step.name}`);
  }
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll structure tests passed");