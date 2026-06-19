#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalogDir = path.join(root, "agents", "catalog");

const BROKEN = /]\.join\("\s*\n\s*"\),/s;
const FIXED = '].join("\\n"),';

let fixed = 0;
for (const dir of readdirSync(catalogDir)) {
  const file = path.join(catalogDir, dir, "evals", "smoke-dossier.eval.ts");
  if (!existsSync(file)) continue;
  const text = readFileSync(file, "utf8");
  if (!BROKEN.test(text) && text.includes('].join("\\n")')) continue;
  if (!BROKEN.test(text)) continue;
  writeFileSync(file, text.replace(BROKEN, FIXED));
  fixed += 1;
}

console.log(`fixed ${fixed} smoke-dossier.eval.ts files`);