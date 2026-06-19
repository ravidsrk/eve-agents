// @eve-catalog/monid-tools — client for Monid (https://docs.monid.ai), the agent-native tool router.
//
// Monid exposes discover / inspect / run over an HTTP API authenticated with a Bearer key.
// `discover` and `inspect` are free; `run` is PAID (PER_CALL or PER_RESULT). This client
// enforces a per-process USD budget cap and logs every paid call to a JSONL cost ledger.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

function readEnvLocalValue(key, startDir = process.cwd()) {
  let dir = startDir;
  for (let i = 0; i < 8 && dir !== dirname(dir); i++) {
    const file = join(dir, ".env.local");
    if (existsSync(file)) {
      for (const line of readFileSync(file, "utf8").split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 1) continue;
        const k = trimmed.slice(0, eq).trim();
        if (k === key) return trimmed.slice(eq + 1).trim();
      }
    }
    dir = dirname(dir);
  }
  return undefined;
}

const BASE_URL = process.env.MONID_BASE_URL || "https://api.monid.ai";

/** USD budget cap for paid `run` calls in this process. Override with MONID_BUDGET_USD. */
export const BUDGET_USD = Number(process.env.MONID_BUDGET_USD ?? "5");
/** Max USD a single `run` is allowed to cost. Override with MONID_MAX_CALL_USD. */
export const MAX_CALL_USD = Number(process.env.MONID_MAX_CALL_USD ?? "0.25");

const COST_LOG = process.env.MONID_COST_LOG || "/workspace/.monid-costs.jsonl";

let _spent = 0;

export function amountSpent() {
  return _spent;
}

function logCost(entry) {
  try {
    mkdirSync(dirname(COST_LOG), { recursive: true });
    appendFileSync(COST_LOG, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n");
  } catch {
    /* logging is best-effort */
  }
}

function apiKey() {
  const k = process.env.MONID_API_KEY || readEnvLocalValue("MONID_API_KEY");
  if (!k) throw new Error("MONID_API_KEY is not set. Add it to .env.local.");
  return k;
}

async function monidFetch(path, body, { method = "POST" } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(`Monid ${path} failed: HTTP ${res.status} ${JSON.stringify(json)}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

/** Search for endpoints by natural-language query. Free. */
export async function discover(query, limit = 5) {
  return monidFetch("/v1/discover", { query, limit: Math.min(Math.max(limit, 1), 20) });
}

/** Inspect a discovered endpoint's schema + pricing. Free. */
export async function inspect(provider, endpoint) {
  return monidFetch("/v1/inspect", { provider, endpoint });
}

/** Current wallet balance (USD). */
export async function walletBalance() {
  return monidFetch("/v1/wallet/balance", undefined, { method: "GET" });
}

function estimateCost(priceObj) {
  // price: { type: "PER_CALL" | "PER_RESULT", amount, currency }
  if (!priceObj || typeof priceObj.amount !== "number") return 0;
  return priceObj.amount; // PER_RESULT is per result; we treat amount as the upper-bound unit cost
}

/**
 * Execute a paid Monid endpoint, enforcing budget caps and logging the cost.
 * @param {object} args { provider, endpoint, input, price? }
 */
export async function run({ provider, endpoint, input, query, path, price }) {
  const unit = estimateCost(price);
  if (unit > MAX_CALL_USD) {
    throw new Error(
      `Monid run refused: estimated $${unit} exceeds per-call cap $${MAX_CALL_USD} (${provider}${endpoint}).`,
    );
  }
  if (_spent + unit > BUDGET_USD) {
    throw new Error(
      `Monid run refused: would exceed budget cap $${BUDGET_USD} (spent $${_spent.toFixed(4)}).`,
    );
  }
  const payload = { provider, endpoint };
  if (input != null) payload.input = input;
  if (query != null) payload.queryParams = query;
  if (path != null) payload.pathParams = path;
  const result = await monidFetch("/v1/run", payload);
  // Prefer the server-reported cost when present.
  const charged =
    (result && (result.cost?.amount ?? result.price?.amount)) ?? unit ?? 0;
  _spent += charged;
  logCost({ provider, endpoint, estUsd: unit, chargedUsd: charged, totalSpentUsd: _spent });
  return result;
}

export const config = { BASE_URL, BUDGET_USD, MAX_CALL_USD, COST_LOG };
