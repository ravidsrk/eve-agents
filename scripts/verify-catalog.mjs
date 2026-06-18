#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalogDir = path.join(root, "agents", "catalog");
const requiredFiles = [
  ".env.example",
  ".vercelignore",
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "package.json",
  "tsconfig.json",
  "agent/agent.ts",
  "agent/channels/eve.ts",
  "agent/instructions.md",
  "agent/data/dossier.json",
  "agent/data/records.json",
  "agent/lib/profile.ts",
  "agent/skills/operating-playbook/SKILL.md",
  "agent/sandbox/sandbox.ts",
  "agent/tools/load_dossier.ts",
  "agent/tools/search_records.ts",
  "agent/tools/analyze_records.ts",
  "agent/tools/write_report.ts",
  "agent/tools/record_decision.ts",
  "agent/tools/fetch_live_json.ts",
  "evidence/dry-run.json",
];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

const dirs = readdirSync(catalogDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => /^\d{2}-/.test(name))
  .sort();

if (dirs.length !== 50) fail(`expected 50 catalog agents, found ${dirs.length}`);

for (const dir of dirs) {
  const full = path.join(catalogDir, dir);
  for (const rel of requiredFiles) {
    if (!existsSync(path.join(full, rel))) fail(`${dir} missing ${rel}`);
  }

  const pkg = readJson(path.join(full, "package.json"));
  if (pkg.name !== `arch-${dir}`) fail(`${dir} package name mismatch: ${pkg.name}`);
  if (!pkg.dependencies?.["@lab/agent-kit"]) fail(`${dir} missing @lab/agent-kit dependency`);

  const dossier = readJson(path.join(full, "agent/data/dossier.json"));
  if (dossier.id !== dir) fail(`${dir} dossier id mismatch: ${dossier.id}`);
  if (!Array.isArray(dossier.evidenceRequired) || dossier.evidenceRequired.length < 3) {
    fail(`${dir} dossier evidence requirements incomplete`);
  }

  const records = readJson(path.join(full, "agent/data/records.json"));
  if (!Array.isArray(records) || records.length < 3) fail(`${dir} needs at least three records`);

  const dryRun = readJson(path.join(full, "evidence/dry-run.json"));
  if (dryRun.agent !== dir) fail(`${dir} dry-run agent mismatch: ${dryRun.agent}`);
}

if (!process.exitCode) {
  console.log(`PASS: verified ${dirs.length} catalog agents`);
}
