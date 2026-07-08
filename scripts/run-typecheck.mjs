#!/usr/bin/env node
/**
 * DEP-001: prefer `tsgo` (@typescript/native-preview); fall back to `tsc`
 * when the dated native-preview binary is missing or fails to start.
 *
 * Usage (from any agent package): node ../../../scripts/run-typecheck.mjs
 * Or via npm workspace: npm run typecheck -w <pkg>
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const tsconfig = path.join(cwd, "tsconfig.json");
if (!existsSync(tsconfig)) {
  console.error(`run-typecheck: no tsconfig.json in ${cwd}`);
  process.exit(2);
}

function run(cmd, args) {
  return spawnSync(cmd, args, { stdio: "inherit", cwd, shell: false });
}

function which(bin) {
  const result = spawnSync(bin, ["--version"], {
    encoding: "utf8",
    cwd,
    shell: false,
  });
  return result.status === 0;
}

if (which("tsgo")) {
  const result = run("tsgo", []);
  process.exit(result.status ?? 1);
}

console.warn(
  "run-typecheck: tsgo unavailable — falling back to tsc --noEmit (install @typescript/native-preview to restore tsgo)",
);

if (!which("tsc")) {
  console.error(
    "run-typecheck: neither tsgo nor tsc is available. Install @typescript/native-preview or typescript.",
  );
  process.exit(1);
}

const result = run("tsc", ["--noEmit", "-p", "tsconfig.json"]);
process.exit(result.status ?? 1);
