// Builds eve's public SandboxSession surface on top of a live SuperServe Sandbox.
//
// We implement the full public surface directly (rather than via eve's internal,
// non-exported `buildSandboxSession`). `run` maps to SuperServe's reliable blocking
// `commands.run`; `spawn` bridges SuperServe's streaming `commands.spawn` to the
// AI-SDK-style process handle (stdout/stderr ReadableStreams + wait()/kill()).

import path from "node:path";
import { bufferToStream, streamToBuffer, applyLineRange } from "./stream-utils.js";

const WORKSPACE = "/workspace";

/** Shell-quote one argv token (same escaping idiom as removePath). */
export function shellQuoteArg(arg) {
  return `'${String(arg).replace(/'/g, "'\\''")}'`;
}

function resolvePath(p) {
  if (p === undefined || p === null || p === "") return WORKSPACE;
  return p.startsWith("/") ? p : path.posix.join(WORKSPACE, p);
}

// Extract a command string from the AI-SDK run/spawn options.
function toCommand(options) {
  if (typeof options === "string") return options;
  if (options?.command) {
    if (Array.isArray(options.command)) {
      return options.command.map(shellQuoteArg).join(" ");
    }
    const parts = [shellQuoteArg(options.command)];
    if (Array.isArray(options.args) && options.args.length) {
      parts.push(...options.args.map(shellQuoteArg));
    }
    return parts.join(" ");
  }
  if (options?.cmd) {
    const parts = [shellQuoteArg(options.cmd)];
    if (Array.isArray(options.args) && options.args.length) {
      parts.push(...options.args.map(shellQuoteArg));
    }
    return parts.join(" ");
  }
  throw new Error("SuperServe sandbox: could not derive command from options " + JSON.stringify(options));
}

export function buildSuperserveSession(sandbox, id, setNetworkPolicy) {
  async function run(options) {
    const command = toCommand(options);
    const res = await sandbox.commands.run(command, {
      cwd: options?.cwd ?? WORKSPACE,
      env: options?.env,
      timeoutMs: options?.timeoutMs,
      signal: options?.signal ?? options?.abortSignal,
    });
    return { stdout: res.stdout, stderr: res.stderr, exitCode: res.exitCode };
  }

  async function spawn(options) {
    const command = toCommand(options);
    const enc = new TextEncoder();
    let outCtrl;
    let errCtrl;
    const stdout = new ReadableStream({ start(c) { outCtrl = c; } });
    const stderr = new ReadableStream({ start(c) { errCtrl = c; } });
    const cs = await sandbox.commands.spawn(command, {
      cwd: options?.cwd ?? WORKSPACE,
      env: options?.env,
      signal: options?.signal ?? options?.abortSignal,
      onStdout: (d) => { try { outCtrl?.enqueue(enc.encode(d)); } catch {} },
      onStderr: (d) => { try { errCtrl?.enqueue(enc.encode(d)); } catch {} },
    });
    let waitResult;
    return {
      stdout,
      stderr,
      async wait() {
        if (!waitResult) waitResult = cs.wait();
        const r = await waitResult;
        try { outCtrl?.close(); } catch {}
        try { errCtrl?.close(); } catch {}
        return { exitCode: r.exitCode };
      },
      kill(signal) {
        cs.kill(signal);
      },
    };
  }

  async function readFileStream({ path: p }) {
    try {
      const bytes = await sandbox.files.read(resolvePath(p));
      return bufferToStream(bytes);
    } catch (e) {
      if (e && (e.statusCode === 404 || e.name === "NotFoundError")) return null;
      throw e;
    }
  }

  async function readBinaryFile({ path: p }) {
    try {
      return await sandbox.files.read(resolvePath(p));
    } catch (e) {
      if (e && (e.statusCode === 404 || e.name === "NotFoundError")) return null;
      throw e;
    }
  }

  async function readTextFile({ path: p, encoding, startLine, endLine }) {
    let text;
    try {
      if (encoding && encoding !== "utf-8" && encoding !== "utf8") {
        const bytes = await sandbox.files.read(resolvePath(p));
        text = Buffer.from(bytes).toString(encoding);
      } else {
        text = await sandbox.files.readText(resolvePath(p));
      }
    } catch (e) {
      if (e && (e.statusCode === 404 || e.name === "NotFoundError")) return null;
      throw e;
    }
    return applyLineRange(text, startLine, endLine);
  }

  async function writeFile({ path: p, content }) {
    let data = content;
    if (content && typeof content.getReader === "function") {
      data = await streamToBuffer(content);
    }
    await sandbox.files.write(resolvePath(p), data);
  }

  async function writeBinaryFile({ path: p, content }) {
    await sandbox.files.write(resolvePath(p), content);
  }

  async function writeTextFile({ path: p, content, encoding }) {
    const data =
      encoding && encoding !== "utf-8" && encoding !== "utf8"
        ? Buffer.from(content, encoding)
        : content;
    await sandbox.files.write(resolvePath(p), data);
  }

  async function removePath({ path: p, force, recursive }) {
    const flags = [];
    if (recursive) flags.push("-r");
    if (force) flags.push("-f");
    const target = resolvePath(p);
    await sandbox.commands.run(`rm ${flags.join(" ")} -- '${target.replace(/'/g, "'\\''")}'`);
  }

  return {
    id,
    resolvePath,
    run,
    spawn,
    readFile: readFileStream,
    readBinaryFile,
    readTextFile,
    writeFile,
    writeBinaryFile,
    writeTextFile,
    removePath,
    setNetworkPolicy: setNetworkPolicy ?? (async () => {}),
  };
}
