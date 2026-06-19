#!/usr/bin/env node
/**
 * Live smoke: one cheap Monid call per production agent tool family.
 * Free to skip when MONID_API_KEY missing; uses .secrets/eve.env like research-monid.mjs.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SECRETS = join(ROOT, ".secrets", "eve.env");

function loadSecretsEnv() {
  if (!existsSync(SECRETS)) return;
  const current = process.env.MONID_API_KEY;
  const needsKey = !current || /REDACTED|CHANGE_ME/i.test(current);
  for (const line of readFileSync(SECRETS, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key === "MONID_API_KEY" && needsKey) process.env.MONID_API_KEY = value;
    else if (!(key in process.env)) process.env[key] = value;
  }
}

loadSecretsEnv();

const { run, amountSpent } = await import("@eve-catalog/monid-tools");

let pass = 0;
let fail = 0;
function check(name, cond) {
  (cond ? pass++ : fail++);
  console.log(`${cond ? "✓" : "✗"} ${name}`);
}

try {
  const e = await run({
    provider: "api.strale.io",
    endpoint: "/x402/error-explain",
    query: { error: "ECONNREFUSED", language: "node" },
    price: { type: "PER_CALL", amount: 0.011 },
  });
  check("P01 explain_error", e.status === "COMPLETED" || e.output?.plain_explanation);
} catch (err) {
  check("P01 explain_error", false);
  console.error("  ", err.message);
}

try {
  const p = await run({
    provider: "api.strale.io",
    endpoint: "/x402/pr-description-generate",
    query: { diff: "diff --git a/foo.ts b/foo.ts\n+export const x = 1;" },
    price: { type: "PER_CALL", amount: 0.011 },
  });
  check("P02 generate_pr_description", p.status === "COMPLETED" || p.output);
} catch (err) {
  check("P02 generate_pr_description", false);
  console.error("  ", err.message);
}

try {
  const w = await run({
    provider: "blockrun.ai",
    endpoint: "/api/v1/exa/search",
    input: { query: "Vercel AI SDK announcement", numResults: 3, category: "news" },
    price: { type: "PER_CALL", amount: 0.011 },
  });
  check("P03 web_search", w.status === "COMPLETED" || w.output);
} catch (err) {
  check("P03 web_search", false);
  console.error("  ", err.message);
}

console.log(`\nspent: $${amountSpent().toFixed(4)} — ${fail === 0 ? "PASS" : "FAIL"} (${pass}/${pass + fail})`);
process.exit(fail === 0 ? 0 : 1);