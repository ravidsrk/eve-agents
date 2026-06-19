// @eve-catalog/superserve-backend — a custom eve SandboxBackend backed by SuperServe
// (Firecracker microVMs with persistent, resumable filesystems).
//
// Why this exists: on hosts without Docker or KVM, eve's local sandbox backends
// (docker / microsandbox) can't run, and vercel() needs a Vercel deployment.
// This backend gives eve real-binary code execution locally by running the
// sandbox on SuperServe, and powers durable resume by reconnecting to the same
// VM across turns / process restarts.
//
// Implements the public SandboxBackend interface: { name, prewarm, create }.
// See RESEARCH.md ("SuperServe integration") and scratchpad for the design.

import { Sandbox } from "@superserve/sdk";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { buildSuperserveSession } from "./session.js";

const BACKEND_NAME = "superserve";

// eve runs `prewarm` (build process) and `create` (Nitro worker) in SEPARATE processes,
// so an in-memory Map can't carry seed files between them. We persist seed files to disk
// under the app root (available to both phases via runtimeContext.appRoot) and replay them
// into the SuperServe VM on first create.
//
// NOTE (sharp edge, see FINDINGS.md): SuperServe 0.7.4's TS SDK has no snapshot-create-from-
// files, so eve's build-time template baking doesn't map cleanly. We seed per-session at
// first create instead. `bootstrap(...)` *functions* can't cross the build/runtime process
// split (a function isn't serializable); use seed files or the sandbox `onSession` hook.
function seedFilePath(appRoot, templateKey) {
  return path.join(appRoot, ".eve", "superserve-seed", `${templateKey}.json`);
}

function mapNetwork(policy) {
  if (!policy || policy === "allow-all") return undefined;
  if (policy === "deny-all") return { denyOut: ["0.0.0.0/0"] };
  // Object form: { allow?: string[], subnets?: { deny?: string[] } }
  const cfg = {};
  if (Array.isArray(policy.allow)) cfg.allowOut = policy.allow;
  else if (policy.allow && typeof policy.allow === "object") cfg.allowOut = Object.keys(policy.allow);
  if (policy.subnets?.deny) cfg.denyOut = policy.subnets.deny;
  return Object.keys(cfg).length ? cfg : undefined;
}

function sanitizeName(s) {
  return ("eve-" + String(s)).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 60);
}

/**
 * @param {object} [opts]
 * @param {string|object} [opts.fromTemplate] SuperServe template name/UUID to boot from.
 * @param {number} [opts.timeoutSeconds] Active-lifetime before auto-pause (default 1800).
 * @param {Record<string,string>} [opts.envVars] Env vars injected into the sandbox.
 * @param {string|object} [opts.networkPolicy] eve network policy applied at create.
 * @param {boolean} [opts.killOnDispose] kill (vs pause) the VM when a session disposes.
 */
export function superserveBackend(opts = {}) {
  const timeoutSeconds = opts.timeoutSeconds ?? 1800;

  return {
    name: BACKEND_NAME,
    killOnDispose: Boolean(opts.killOnDispose),

    async prewarm(input) {
      const seedFiles = (input.seedFiles ?? []).map((f) => ({
        path: f.path,
        // base64 so both text and binary seed files round-trip safely
        b64: Buffer.from(typeof f.content === "string" ? Buffer.from(f.content) : f.content).toString("base64"),
      }));
      const appRoot = input.runtimeContext?.appRoot ?? process.cwd();
      const dest = seedFilePath(appRoot, input.templateKey);
      mkdirSync(path.dirname(dest), { recursive: true });
      writeFileSync(dest, JSON.stringify({ seedFiles }));
      input.log?.(`superserve: persisted ${seedFiles.length} seed file(s) for template ${input.templateKey}`);
      return { reused: false };
    },

    async create(input) {
      const existingId = input.existingMetadata?.superserveSandboxId;
      let sandbox = null;
      let reconnected = false;

      if (existingId) {
        try {
          sandbox = await Sandbox.connect(existingId);
          reconnected = true;
        } catch {
          sandbox = null; // VM gone — fall through to create a fresh one
        }
      }

      if (!sandbox) {
        sandbox = await Sandbox.create({
          name: sanitizeName(input.sessionKey),
          fromTemplate: opts.fromTemplate,
          timeoutSeconds,
          envVars: opts.envVars,
          network: mapNetwork(opts.networkPolicy),
          metadata: {
            ...(input.tags || {}),
            eveSessionKey: String(input.sessionKey).slice(0, 200),
          },
        });
        await sandbox.commands.run("mkdir -p /workspace");
      }

      console.error(
        `[superserve] session=${input.sessionKey} sandbox=${sandbox.id} reconnected=${reconnected}`,
      );

      const session = buildSuperserveSession(sandbox, input.sessionKey, async (policy) => {
        await sandbox.update({ network: mapNetwork(policy) });
      });

      // Seed on first creation of a fresh VM (not on reconnect — /workspace persists).
      if (!reconnected && input.templateKey) {
        const appRoot = input.runtimeContext?.appRoot ?? process.cwd();
        const src = seedFilePath(appRoot, input.templateKey);
        if (existsSync(src)) {
          const { seedFiles } = JSON.parse(readFileSync(src, "utf-8"));
          for (const f of seedFiles) {
            await session.writeBinaryFile({ path: f.path, content: Buffer.from(f.b64, "base64") });
          }
        }
      }

      return {
        session,
        useSessionFn: async (useOpts) => {
          if (useOpts?.networkPolicy) {
            await sandbox.update({ network: mapNetwork(useOpts.networkPolicy) });
          }
          return session;
        },
        async captureState() {
          return {
            backendName: BACKEND_NAME,
            metadata: { superserveSandboxId: sandbox.id },
            sessionKey: input.sessionKey,
          };
        },
        async dispose() {
          try {
            if (opts.killOnDispose) await sandbox.kill();
            else await sandbox.pause(); // preserve /workspace for durable resume
          } catch {
            /* best-effort */
          }
        },
      };
    },
  };
}

export default superserveBackend;
