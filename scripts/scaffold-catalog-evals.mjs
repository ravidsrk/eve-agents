#!/usr/bin/env node
/**
 * Scaffold a minimal smoke eval for every catalog agent (idempotent).
 * Agents with existing evals are skipped.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalogDir = path.join(root, "agents", "catalog");

function smokeEval(agentId, title) {
  return `import { defineEval } from "eve/evals";

export default defineEval({
  description: "Smoke: ${title} loads dossier and completes a turn.",
  async test(t) {
    await t.send(
      [
        "Follow these steps exactly. Do not call record_decision.",
        "1. Call load_dossier.",
        "2. Call analyze_records with query 'priority'.",
        "3. Reply with the word DOSSIER-OK on its own line.",
      ].join(${JSON.stringify("\n")}),
    );
    t.completed();
    t.didNotFail();
    t.calledTool("load_dossier");
    t.calledTool("analyze_records");
    t.messageIncludes("DOSSIER-OK");
  },
});
`;
}

const dirs = readdirSync(catalogDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
  .map((e) => e.name)
  .sort();

let created = 0;
let skipped = 0;

for (const dir of dirs) {
  const evalsDir = path.join(catalogDir, dir, "evals");
  const target = path.join(evalsDir, "smoke-dossier.eval.ts");
  if (existsSync(target)) {
    skipped += 1;
    continue;
  }
  const dossierPath = path.join(catalogDir, dir, "agent", "data", "dossier.json");
  let title = dir;
  if (existsSync(dossierPath)) {
    try {
      title = JSON.parse(readFileSync(dossierPath, "utf8")).title ?? dir;
    } catch {
      // ignore
    }
  }
  mkdirSync(evalsDir, { recursive: true });
  writeFileSync(target, smokeEval(dir, title));
  created += 1;
}

console.log(`scaffold-catalog-evals: created ${created}, skipped ${skipped}`);