#!/usr/bin/env node
/**
 * Phase 0b: Monid discover sweeps for real-world agent patterns.
 * Writes research/discover-results.jsonl (gitignored).
 *
 * Requires MONID_API_KEY in env or .secrets/eve.env (via: set -a && source .secrets/eve.env)
 *
 * Research budget defaults (override in .secrets/eve.env):
 *   MONID_BUDGET_USD=500  MONID_MAX_CALL_USD=5
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SECRETS = join(ROOT, ".secrets", "eve.env");

function isPlaceholderSecret(value) {
  if (!value) return true;
  return /REDACTED|CHANGE_ME|your[_-]?key|\.{3}$/i.test(value);
}

/** Prefer .secrets/eve.env over placeholder env vars (e.g. REDACTED_USE_ENV). */
function loadSecretsEnv() {
  if (!existsSync(SECRETS)) return;
  const current = process.env.MONID_API_KEY;
  const needsKey = !current || isPlaceholderSecret(current);
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

const { discover, walletBalance, amountSpent } = await import("@lab/monid-tools");
const OUT = join(ROOT, "research", "discover-results.jsonl");

const QUERIES = [
  // Frameworks & templates
  "github open source AI agent framework template",
  "vercel eve agent example",
  "langchain agent template production",
  "crewai multi agent template",
  // Business / ops
  "customer support ticket triage automation",
  "incident response on-call runbook agent",
  "SRE log analysis root cause",
  "invoice receipt PDF extraction structured",
  // Engineering
  "pull request code review automation agent",
  "CI failure debug fix agent",
  "repository codebase analysis agent",
  // Data & research
  "competitive intelligence market research agent",
  "social media sentiment monitoring brand",
  "web scraping research summarize agent",
  "SQL database analytics natural language",
  // Verticals
  "legal contract review clause extraction",
  "sales lead enrichment CRM agent",
  "e-commerce product catalog agent",
  "healthcare prior authorization agent",
];

mkdirSync(dirname(OUT), { recursive: true });

let wallet;
try {
  wallet = await walletBalance();
  console.log("wallet:", JSON.stringify(wallet.balance ?? wallet));
} catch (e) {
  console.error("Monid unavailable:", e.message);
  console.error("Set MONID_API_KEY in .secrets/eve.env then: bash scripts/setup.sh");
  process.exit(2);
}

for (const query of QUERIES) {
  try {
    const res = await discover(query, 5);
    const entry = { ts: new Date().toISOString(), query, count: res.count, results: res.results };
    appendFileSync(OUT, JSON.stringify(entry) + "\n");
    console.log(`\n## ${query} (${res.count ?? res.results?.length ?? 0})`);
    for (const r of res.results ?? []) {
      const price = r.price?.amount != null ? `$${r.price.amount}` : "free?";
      console.log(`  - ${r.provider}${r.endpoint} | ${price} | ${(r.description ?? "").slice(0, 60)}`);
    }
  } catch (e) {
    console.error(`  FAIL ${query}:`, e.message);
  }
}

console.log(`\nspent: $${amountSpent().toFixed(4)} → ${OUT}`);