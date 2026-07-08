#!/usr/bin/env node
/**
 * DEP-001: run-typecheck prefers tsgo; falls back to tsc when tsgo is missing.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(root, "scripts/run-typecheck.mjs");
const work = mkdtempSync(path.join(tmpdir(), "run-typecheck-"));
const bin = path.join(work, "bin");
mkdirSync(bin);

// Isolate PATH so repo node_modules/.bin tsgo cannot leak into the fallback case.
const isolatedPath = `${bin}:${path.dirname(process.execPath)}:/usr/bin:/bin`;

writeFileSync(
  path.join(work, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: { noEmit: true, strict: true, skipLibCheck: true },
    include: [],
  }),
);

function writeShim(name, body) {
  const file = path.join(bin, name);
  writeFileSync(file, `#!/usr/bin/env node\n${body}\n`);
  chmodSync(file, 0o755);
}

{
  writeShim("tsgo", "console.log('tsgo-shim 1.0.0'); process.exit(0);");
  writeShim("tsc", "console.error('tsc should not run'); process.exit(9);");
  const result = spawnSync(process.execPath, [script], {
    cwd: work,
    encoding: "utf8",
    env: { ...process.env, PATH: isolatedPath },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout + result.stderr, /tsgo-shim/);
  console.log("PASS: prefers tsgo when available");
}

{
  rmSync(path.join(bin, "tsgo"));
  writeShim("tsc", "console.log('tsc-shim'); process.exit(0);");
  const result = spawnSync(process.execPath, [script], {
    cwd: work,
    encoding: "utf8",
    env: { ...process.env, PATH: isolatedPath },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stderr, /falling back to tsc/);
  assert.match(result.stdout + result.stderr, /tsc-shim/);
  console.log("PASS: falls back to tsc when tsgo missing");
}

rmSync(work, { recursive: true, force: true });
console.log("PASS: run-typecheck fallback (DEP-001)");
