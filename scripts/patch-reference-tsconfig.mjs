#!/usr/bin/env node
/**
 * Align reference fixture tsconfigs with catalog: allow .ts imports and
 * include ../_shared so judge-model imports typecheck (noEmit).
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const refDir = path.join(root, "agents", "reference");
let updated = 0;

for (const name of readdirSync(refDir, { withFileTypes: true })) {
  if (!name.isDirectory() || !name.name.startsWith("agent-")) continue;
  const tsconfigPath = path.join(refDir, name.name, "tsconfig.json");
  const cfg = JSON.parse(readFileSync(tsconfigPath, "utf8"));
  cfg.compilerOptions = {
    ...cfg.compilerOptions,
    allowImportingTsExtensions: true,
    noEmit: true,
  };
  delete cfg.compilerOptions.rootDir;
  delete cfg.compilerOptions.outDir;
  delete cfg.compilerOptions.declaration;
  const include = new Set(cfg.include ?? []);
  include.add("agent/**/*.ts");
  include.add("evals/**/*.ts");
  include.add("../_shared/**/*.ts");
  include.add(".eve/**/*.d.ts");
  cfg.include = [...include];
  writeFileSync(tsconfigPath, `${JSON.stringify(cfg, null, 2)}\n`);
  updated += 1;
}

console.log(`updated ${updated} reference tsconfigs`);
