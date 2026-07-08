#!/usr/bin/env node
import { createWriteStream } from "node:fs";
import {
  handleStreamLine,
  streamExitCode,
} from "./lib/stream-capture.mjs";

const [url, outFile, timeoutSeconds = "180"] = process.argv.slice(2);
if (!url || !outFile) {
  console.error("Usage: node scripts/stream_until_done.mjs <url> <out-file> [timeout-seconds]");
  process.exit(2);
}

const timeoutMs = Number(timeoutSeconds) * 1000;
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);
const out = createWriteStream(outFile, { flags: "w" });
const state = {
  events: 0,
  done: false,
  failed: false,
  write: (line) => {
    out.write(`${line}\n`);
  },
};
let buffer = "";
let httpFailed = false;

try {
  const res = await fetch(url, { signal: controller.signal });
  if (!res.ok) {
    console.error(`stream HTTP ${res.status}`);
    httpFailed = true;
  } else {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (!state.done) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        handleStreamLine(line, state);
        if (state.done) {
          try {
            await reader.cancel();
          } catch {
            // cancel may surface as AbortError; terminal state already recorded
          }
          break;
        }
      }
    }
    if (buffer.trim()) handleStreamLine(buffer, state);
  }
} catch (error) {
  if (error?.name === "AbortError" && state.events > 0 && !state.done) {
    console.error(`stream timed out after ${timeoutSeconds}s with ${state.events} events`);
  } else if (!state.done) {
    console.error(`stream failed: ${error}`);
  }
  if (!state.done) httpFailed = true;
} finally {
  clearTimeout(timer);
  await new Promise((resolve) => out.end(resolve));
}

const code = streamExitCode({
  done: state.done,
  failed: state.failed,
  exitCode: httpFailed ? 1 : 0,
});

if (!state.done) {
  console.error("stream ended before completion marker");
}
if (state.failed) {
  console.error("stream ended with session.failed or turn.failed");
}
if (code === 0) {
  console.log(`stream captured ${state.events} events`);
}
process.exitCode = code;
