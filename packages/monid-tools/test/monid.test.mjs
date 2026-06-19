import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, it } from "node:test";

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const costLogPath = join(
  mkdtempSync(join(tmpdir(), "monid-test-")),
  "costs.jsonl",
);

process.env.MONID_API_KEY = "test-key";
process.env.MONID_BUDGET_USD = "1";
process.env.MONID_MAX_CALL_USD = "1";
process.env.MONID_COST_LOG = costLogPath;

const { run, amountSpent, __testReset, config, BUDGET_USD } = await import("../index.js");

const price = { type: "PER_CALL", amount: 0.3, currency: "USD" };
const runArgs = { provider: "p", endpoint: "/e", input: {}, price };

let originalFetch;

function mockFetch(handler) {
  globalThis.fetch = async (url, init) => handler(url, init);
}

describe("run() budget guard (COST-001)", () => {
  beforeEach(() => {
    __testReset();
    originalFetch = globalThis.fetch;
    mockFetch(async () =>
      new Response(JSON.stringify({ cost: { amount: 0.3 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    __testReset();
  });

  it("rejects concurrent runs once the serialized budget is exhausted", async () => {
    const attempts = 4;
    const results = await Promise.allSettled(
      Array.from({ length: attempts }, () => run({ ...runArgs })),
    );

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    assert.equal(fulfilled.length, 3);
    assert.equal(rejected.length, 1);
    assert.match(rejected[0].reason.message, /would exceed budget cap/);
    assert.ok(amountSpent() <= BUDGET_USD + 1e-9);
    assert.ok(Math.abs(amountSpent() - 0.9) < 1e-9);
  });

  it("refunds the reservation when the fetch throws", async () => {
    mockFetch(async () => new Response("nope", { status: 500 }));

    await assert.rejects(() => run({ ...runArgs }), /Monid \/v1\/run failed/);
    assert.equal(amountSpent(), 0);
  });

  it("reconciles to the server-reported charge after reserving the estimate", async () => {
    mockFetch(async () =>
      new Response(JSON.stringify({ cost: { amount: 0.25 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await run({ ...runArgs });
    assert.equal(amountSpent(), 0.25);
  });
});

describe("cost ledger (COST-003)", () => {
  beforeEach(() => {
    __testReset();
    writeFileSync(costLogPath, "");
    originalFetch = globalThis.fetch;
    mockFetch(async () =>
      new Response(JSON.stringify({ cost: { amount: 0.1 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    __testReset();
  });

  it("appends a ledger line to the configured cost log path", async () => {
    await run({ ...runArgs, price: { type: "PER_CALL", amount: 0.1, currency: "USD" } });

    const lines = readFileSync(costLogPath, "utf8").trim().split("\n");
    assert.equal(lines.length, 1);
    const entry = JSON.parse(lines[0]);
    assert.equal(entry.provider, "p");
    assert.equal(entry.endpoint, "/e");
    assert.equal(entry.chargedUsd, 0.1);
    assert.equal(config.COST_LOG, costLogPath);
  });

  it("defaults COST_LOG to os.tmpdir() when MONID_COST_LOG is unset", () => {
    const script = `
      delete process.env.MONID_COST_LOG;
      process.env.MONID_API_KEY = "test-key";
      const { config } = await import(${JSON.stringify(join(pkgRoot, "index.js"))});
      const os = await import("node:os");
      const path = await import("node:path");
      const expected = path.join(os.tmpdir(), "monid-costs.jsonl");
      if (config.COST_LOG !== expected) process.exit(2);
    `;

    const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
      encoding: "utf8",
      env: { ...process.env, MONID_COST_LOG: undefined },
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
  });

  it("warns once when the ledger write fails", () => {
    const badParent = join(tmpdir(), `monid-bad-${Date.now()}`);
    writeFileSync(badParent, "not-a-directory");
    const badLogPath = join(badParent, "costs.jsonl");

    const script = `
      process.env.MONID_API_KEY = "test-key";
      process.env.MONID_BUDGET_USD = "5";
      process.env.MONID_MAX_CALL_USD = "1";
      process.env.MONID_COST_LOG = ${JSON.stringify(badLogPath)};
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ cost: { amount: 0.1 } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      const warnings = [];
      const originalWarn = console.warn;
      console.warn = (...args) => warnings.push(args.join(" "));
      const { run } = await import(${JSON.stringify(join(pkgRoot, "index.js"))});
      await run({
        provider: "p",
        endpoint: "/e",
        input: {},
        price: { type: "PER_CALL", amount: 0.1, currency: "USD" },
      });
      await run({
        provider: "p",
        endpoint: "/e2",
        input: {},
        price: { type: "PER_CALL", amount: 0.1, currency: "USD" },
      });
      console.warn = originalWarn;
      if (warnings.length !== 1) {
        console.error("expected 1 warning, got", warnings.length, warnings);
        process.exit(3);
      }
      if (!warnings[0].includes("failed to write cost ledger")) process.exit(4);
    `;

    const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
      encoding: "utf8",
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);

    try {
      rmSync(badParent);
    } catch {
      /* best-effort */
    }
  });
});