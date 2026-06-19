import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  artifactsRoot,
  fetchLiveJsonTool,
  isFetchHostAllowlisted,
  isRestrictedFetchHost,
  loadDossierTool,
  recordDecisionTool,
  resolveAppRoot,
  writeReportTool,
} from "../tools.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const sampleAgentRoot = path.join(repoRoot, "agents/catalog/01-revenue-analyst");

const ENV_KEYS = [
  "ALLOW_EXTERNAL_FETCH",
  "FETCH_ALLOW_HOSTS",
  "EVE_APP_ROOT",
  "EVE_ARTIFACTS_DIR",
  "INIT_CWD",
  "VERCEL",
];

let savedEnv = {};
let savedCwd = process.cwd();
let tempDirs = [];

function stashEnv() {
  savedEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
}

function restoreEnv() {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
}

function makeTempDir(prefix) {
  const dir = mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

describe("resolveAppRoot (COUP-001)", () => {
  beforeEach(() => {
    stashEnv();
    savedCwd = process.cwd();
  });

  afterEach(() => {
    restoreEnv();
    process.chdir(savedCwd);
  });

  it("honors EVE_APP_ROOT", () => {
    process.env.EVE_APP_ROOT = sampleAgentRoot;
    assert.equal(resolveAppRoot(), sampleAgentRoot);
  });

  it("walks up from an agent subdirectory to the package root", () => {
    delete process.env.EVE_APP_ROOT;
    delete process.env.INIT_CWD;
    process.chdir(path.join(sampleAgentRoot, "agent"));
    assert.equal(resolveAppRoot(), sampleAgentRoot);
  });
});

describe("artifactsRoot (REL-001)", () => {
  beforeEach(stashEnv);
  afterEach(restoreEnv);

  it("uses EVE_ARTIFACTS_DIR when set", () => {
    const dir = makeTempDir("eve-artifacts-");
    process.env.EVE_ARTIFACTS_DIR = dir;
    delete process.env.VERCEL;
    assert.equal(artifactsRoot(), dir);
  });

  it("uses os.tmpdir on Vercel", () => {
    delete process.env.EVE_ARTIFACTS_DIR;
    process.env.VERCEL = "1";
    assert.equal(artifactsRoot(), os.tmpdir());
  });
});

describe("fetch host guards (SEC-002)", () => {
  beforeEach(stashEnv);
  afterEach(restoreEnv);

  it("flags restricted hosts", () => {
    assert.equal(isRestrictedFetchHost("localhost"), true);
    assert.equal(isRestrictedFetchHost("169.254.169.254"), true);
    assert.equal(isRestrictedFetchHost("10.0.0.1"), true);
    assert.equal(isRestrictedFetchHost("example.com"), false);
  });

  it("requires FETCH_ALLOW_HOSTS when external fetch is enabled", async () => {
    process.env.ALLOW_EXTERNAL_FETCH = "1";
    delete process.env.FETCH_ALLOW_HOSTS;

    const metadata = await fetchLiveJsonTool.execute({
      url: "https://169.254.169.254/latest/meta-data/",
    });
    assert.equal(metadata.blocked, true);

    const localhost = await fetchLiveJsonTool.execute({ url: "https://localhost/health" });
    assert.equal(localhost.blocked, true);
  });

  it("allows an allowlisted host and returns fetch payload", async () => {
    process.env.ALLOW_EXTERNAL_FETCH = "1";
    process.env.FETCH_ALLOW_HOSTS = "api.example.com";

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 200,
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });

    try {
      assert.equal(isFetchHostAllowlisted("api.example.com"), true);
      const result = await fetchLiveJsonTool.execute({ url: "https://api.example.com/data" });
      assert.equal(result.blocked, undefined);
      assert.equal(result.status, 200);
      assert.equal(result.ok, true);
      assert.deepEqual(result.json, { ok: true });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe("tool integration", () => {
  beforeEach(() => {
    stashEnv();
    savedCwd = process.cwd();
  });

  afterEach(() => {
    restoreEnv();
    process.chdir(savedCwd);
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("loads dossier when EVE_APP_ROOT is set and cwd is monorepo root (COUP-001)", async () => {
    process.env.EVE_APP_ROOT = sampleAgentRoot;
    process.chdir(repoRoot);
    const dossier = await loadDossierTool.execute({});
    assert.equal(dossier.id, "01-revenue-analyst");
    assert.equal(dossier.title, "Revenue analyst");
  });

  it("writes report artifacts to writable root on Vercel (REL-001)", async () => {
    process.env.EVE_APP_ROOT = sampleAgentRoot;
    process.env.VERCEL = "1";
    delete process.env.EVE_ARTIFACTS_DIR;

    const result = await writeReportTool.execute({
      filename: "unit-test-report.md",
      title: "Unit Test Report",
      markdown: "Body",
    });

    assert.ok(result.path.startsWith(os.tmpdir()));
    assert.ok(existsSync(result.path));
    assert.match(readFileSync(result.path, "utf8"), /Unit Test Report/);
  });

  it("records decisions under artifacts root (REL-001)", async () => {
    const artifactsDir = makeTempDir("eve-decisions-");
    process.env.EVE_APP_ROOT = sampleAgentRoot;
    process.env.EVE_ARTIFACTS_DIR = artifactsDir;
    delete process.env.VERCEL;

    const entry = await recordDecisionTool.execute({
      action: "notify",
      target: "oncall",
      reason: "test",
    });

    assert.equal(entry.status, "recorded");
    const decisionsFile = path.join(artifactsDir, ".agent-artifacts", "revenue-analyst", "decisions.jsonl");
    assert.ok(existsSync(decisionsFile));
    assert.match(readFileSync(decisionsFile, "utf8"), /"action":"notify"/);
  });
});