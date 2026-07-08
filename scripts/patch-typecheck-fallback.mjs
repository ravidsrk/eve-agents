#!/usr/bin/env node
/**
 * One-shot: point every agent package typecheck script at run-typecheck.mjs
 * (tsgo with tsc fallback). Safe to re-run.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const layers = ["catalog", "reference", "production", "integrations"];
const nextScript = "node ../../../scripts/run-typecheck.mjs";
let updated = 0;

for (const layer of layers) {
  const dir = path.join(root, "agents", layer);
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (!name.isDirectory() || name.name.startsWith("_")) continue;
    const pkgPath = path.join(dir, name.name, "package.json");
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (!pkg.scripts?.typecheck) continue;
      if (pkg.scripts.typecheck === nextScript) continue;
      pkg.scripts.typecheck = nextScript;
      writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
      updated += 1;
    } catch {
      /* skip non-packages */
    }
  }
}

console.log(`updated typecheck scripts in ${updated} agent packages`);
