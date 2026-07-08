#!/usr/bin/env node
/**
 * REL-002 acceptance: turn.failed / session.failed must exit non-zero;
 * session.completed must exit 0.
 */
import assert from "node:assert/strict";
import {
  classifyStreamEvent,
  handleStreamLine,
  streamExitCode,
} from "./lib/stream-capture.mjs";

function capture(lines) {
  const state = { events: 0, done: false, failed: false, written: [] };
  state.write = (line) => state.written.push(line);
  for (const line of lines) handleStreamLine(line, state);
  return state;
}

{
  const state = capture([
    JSON.stringify({ type: "message.appended", text: "hi" }),
    JSON.stringify({ type: "session.completed" }),
  ]);
  assert.equal(state.done, true);
  assert.equal(state.failed, false);
  assert.equal(streamExitCode(state), 0);
  console.log("PASS: session.completed exits 0");
}

{
  const state = capture([
    JSON.stringify({ type: "message.appended", text: "hi" }),
    JSON.stringify({ type: "turn.failed", error: "boom" }),
  ]);
  assert.equal(state.done, true);
  assert.equal(state.failed, true);
  assert.equal(streamExitCode(state), 1);
  console.log("PASS: turn.failed exits non-zero");
}

{
  const state = capture([JSON.stringify({ type: "session.failed", error: "dead" })]);
  assert.equal(state.done, true);
  assert.equal(state.failed, true);
  assert.equal(streamExitCode(state), 1);
  console.log("PASS: session.failed exits non-zero");
}

{
  const state = capture([JSON.stringify({ type: "message.appended", text: "hi" })]);
  assert.equal(state.done, false);
  assert.equal(streamExitCode(state), 1);
  console.log("PASS: incomplete stream exits non-zero");
}

{
  assert.deepEqual(classifyStreamEvent({ type: "session.waiting" }), {
    terminal: true,
    failed: false,
  });
  console.log("PASS: session.waiting is terminal success");
}

console.log("PASS: stream_until_done failure handling (REL-002)");
