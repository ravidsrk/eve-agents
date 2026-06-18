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
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { discover, walletBalance, amountSpent } from "@lab/monid-tools";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
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