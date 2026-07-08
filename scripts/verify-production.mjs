#!/usr/bin/env node
/**
 * SEC-003 / COUP-002: production agents must ship authenticated channels
 * and dual-track profile wiring (same posture as catalog).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const productionDir = path.join(root, "agents", "production");

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

const sharedChannel = path.join(productionDir, "_shared/channels/eve.ts");
if (!existsSync(sharedChannel)) {
  fail("agents/production/_shared/channels/eve.ts missing");
} else {
  const shared = readFileSync(sharedChannel, "utf8");
  if (!shared.includes("routeAuth")) {
    fail("_shared/channels/eve.ts must use routeAuth()");
  }
}

const dirs = readdirSync(productionDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^p\d{2}-/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

if (dirs.length !== 10) fail(`expected 10 production agents, found ${dirs.length}`);

for (const dir of dirs) {
  const full = path.join(productionDir, dir);
  const channel = path.join(full, "agent/channels/eve.ts");
  if (!existsSync(channel)) {
    fail(`${dir} missing agent/channels/eve.ts`);
  } else {
    const text = readFileSync(channel, "utf8");
    if (!text.includes("routeAuth") || !text.includes("@eve-agents/agent-kit/route-auth")) {
      fail(`${dir} agent/channels/eve.ts must wire routeAuth from @eve-agents/agent-kit/route-auth`);
    }
  }

  const agentTs = path.join(full, "agent/agent.ts");
  if (!existsSync(agentTs)) {
    fail(`${dir} missing agent/agent.ts`);
  } else {
    const text = readFileSync(agentTs, "utf8");
    if (!text.includes("resolveModel") || !text.includes("@eve-agents/profile")) {
      fail(`${dir} agent.ts must use resolveModel from @eve-agents/profile`);
    }
    if (text.includes("orModel(")) {
      fail(`${dir} agent.ts must not use lab-only orModel()`);
    }
  }

  const pkg = JSON.parse(readFileSync(path.join(full, "package.json"), "utf8"));
  if (!pkg.dependencies?.["@eve-agents/profile"]) {
    fail(`${dir} missing @eve-agents/profile dependency`);
  }
  if (!pkg.dependencies?.["@eve-agents/agent-kit"]) {
    fail(`${dir} missing @eve-agents/agent-kit dependency`);
  }
}

if (!process.exitCode) {
  console.log(`PASS: verified ${dirs.length} production agents (channels + dual-track)`);
}
