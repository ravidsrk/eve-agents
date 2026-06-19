#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalogDir = path.join(root, "agents", "catalog");

const CONFIG = `import { defineEvalConfig } from "eve/evals";

export default defineEvalConfig({});
`;

let created = 0;
for (const dir of readdirSync(catalogDir)) {
  if (!/^\d{2}-/.test(dir)) continue;
  const evalsDir = path.join(catalogDir, dir, "evals");
  if (!existsSync(evalsDir)) continue;
  const target = path.join(evalsDir, "evals.config.ts");
  if (existsSync(target)) continue;
  writeFileSync(target, CONFIG);
  created += 1;
}

console.log(`scaffold-eval-config: created ${created} evals.config.ts files`);