#!/usr/bin/env node
/**
 * Kill orphaned SuperServe sandboxes (frees the 30-sandbox team quota).
 * Usage: SUPERSERVE_API_KEY=... node scripts/cleanup-superserve.mjs [--dry-run]
 */
import { Sandbox } from "@superserve/sdk";

const dryRun = process.argv.includes("--dry-run");
const apiKey = process.env.SUPERSERVE_API_KEY?.trim();
if (!apiKey) {
  console.error("SUPERSERVE_API_KEY is required");
  process.exit(1);
}

const sandboxes = await Sandbox.list({ apiKey });
console.log(`Found ${sandboxes.length} sandbox(es)`);

let killed = 0;
for (const info of sandboxes) {
  const label = `${info.id} (${info.name}, ${info.status})`;
  if (dryRun) {
    console.log(`DRY-RUN would kill: ${label}`);
    continue;
  }
  try {
    await Sandbox.killById(info.id, { apiKey });
    console.log(`Killed: ${label}`);
    killed += 1;
  } catch (err) {
    console.warn(`Failed to kill ${info.id}:`, err?.message ?? err);
  }
}

if (!dryRun) {
  console.log(`Cleanup complete: ${killed}/${sandboxes.length} killed`);
}