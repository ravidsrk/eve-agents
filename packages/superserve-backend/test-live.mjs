// Live proof of the SuperServe-backed eve SandboxSession primitives + durable resume.
import { Sandbox } from "@superserve/sdk";
import { buildSuperserveSession } from "./session.js";

function log(...a) { console.log("[superserve-test]", ...a); }

const TEMPLATE = process.argv[2] || "superserve/python-ml";
const t0 = Date.now();
log("creating sandbox from template", TEMPLATE, "...");
const sandbox = await Sandbox.create({ name: "eve-backend-test", fromTemplate: TEMPLATE, timeoutSeconds: 600 });
await sandbox.commands.run("mkdir -p /workspace");
log("created", sandbox.id, "in", Date.now() - t0, "ms");

const session = buildSuperserveSession(sandbox, "test-session", async () => {});

// 1) write a text file via the eve session surface
await session.writeTextFile({ path: "data.txt", content: "hello from eve\nline2\nline3\n" });
log("wrote /workspace/data.txt");

// 2) run a real binary (python3) that reads the file
await session.writeTextFile({
  path: "run.py",
  content: "print(open('/workspace/data.txt').read().upper())\nprint('python ok')\n",
});
const r = await session.run({ command: "python3 run.py" });
log("run exitCode=", r.exitCode);
log("run stdout=", JSON.stringify(r.stdout));
if (r.stderr) log("run stderr=", JSON.stringify(r.stderr));

// 3) readTextFile with a line range
const ranged = await session.readTextFile({ path: "data.txt", startLine: 2, endLine: 3 });
log("readTextFile lines 2-3 =", JSON.stringify(ranged));

// 4) spawn a short streaming process
const proc = await session.spawn({ command: "for i in 1 2 3; do echo tick-$i; sleep 0.2; done" });
const dec = new TextDecoder();
let spawnOut = "";
const reader = proc.stdout.getReader();
const pump = (async () => { for (;;) { const { done, value } = await reader.read(); if (done) break; spawnOut += dec.decode(value); } })();
const w = await proc.wait();
await pump;
log("spawn exitCode=", w.exitCode, "stdout=", JSON.stringify(spawnOut.trim()));

// 5) durable resume: write a marker, pause, reconnect, confirm FS persisted
await session.writeTextFile({ path: "marker.txt", content: "persisted-value-42\n" });
log("pausing sandbox...");
await sandbox.pause();
log("reconnecting to", sandbox.id, "...");
const reSandbox = await Sandbox.connect(sandbox.id);
const reSession = buildSuperserveSession(reSandbox, "test-session", async () => {});
const marker = await reSession.readTextFile({ path: "marker.txt" });
log("after resume, marker.txt =", JSON.stringify(marker));

// 6) removePath
await reSession.removePath({ path: "marker.txt", force: true });
const gone = await reSession.readTextFile({ path: "marker.txt" });
log("after removePath, marker.txt =", gone === null ? "null (deleted ✓)" : JSON.stringify(gone));

log("cleaning up (kill)...");
await reSandbox.kill();

const ok =
  r.exitCode === 0 &&
  r.stdout.includes("HELLO FROM EVE") &&
  ranged === "line2\nline3\n" &&
  w.exitCode === 0 &&
  spawnOut.includes("tick-3") &&
  marker === "persisted-value-42\n" &&
  gone === null;
log(ok ? "ALL CHECKS PASSED ✓" : "SOME CHECKS FAILED ✗");
process.exit(ok ? 0 : 1);
