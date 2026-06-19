#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalogDir = path.join(root, "agents", "catalog");

/** Flagship requires multiple scored evals. */
const FLAGSHIP = "06-incident-commander";
const MIN_EVALS_FLAGSHIP = 3;
const MIN_EVALS_CATALOG = 1;

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

const dirs = readdirSync(catalogDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
  .map((e) => e.name)
  .sort();

if (dirs.length !== 50) fail(`expected 50 catalog agents, found ${dirs.length}`);

let totalEvals = 0;

for (const dir of dirs) {
  const evalsDir = path.join(catalogDir, dir, "evals");
  const evalFiles = existsSync(evalsDir)
    ? readdirSync(evalsDir).filter((f) => f.endsWith(".eval.ts"))
    : [];

  const minRequired = dir === FLAGSHIP ? MIN_EVALS_FLAGSHIP : MIN_EVALS_CATALOG;
  if (evalFiles.length < minRequired) {
    fail(`${dir} needs at least ${minRequired} eval(s), found ${evalFiles.length}`);
  }

  for (const file of evalFiles) {
    const text = readFileSync(path.join(evalsDir, file), "utf8");
    if (!text.includes("defineEval")) fail(`${dir}/evals/${file} missing defineEval`);
    if (!text.includes("async test")) fail(`${dir}/evals/${file} missing test(t)`);
  }

  totalEvals += evalFiles.length;
}

if (!process.exitCode) {
  console.log(
    `PASS: ${totalEvals} eval files across ${dirs.length} catalog agents (flagship ≥${MIN_EVALS_FLAGSHIP})`,
  );
}