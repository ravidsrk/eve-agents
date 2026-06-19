#!/usr/bin/env node
import { createWriteStream } from "node:fs";

const [url, outFile, timeoutSeconds = "180"] = process.argv.slice(2);
if (!url || !outFile) {
  console.error("Usage: node scripts/stream_until_done.mjs <url> <out-file> [timeout-seconds]");
  process.exit(2);
}

const timeoutMs = Number(timeoutSeconds) * 1000;
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);
const out = createWriteStream(outFile, { flags: "w" });
let buffer = "";
let events = 0;
let done = false;
let failed = false;

function handleLine(line) {
  if (!line.trim()) return;
  events += 1;
  out.write(`${line}\n`);
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    return;
  }
  if (event.type === "session.failed" || event.type === "turn.failed") {
    done = true;
    failed = true;
    return;
  }
  if (event.type === "session.waiting" || event.type === "session.completed") {
    done = true;
  }
}

try {
  const res = await fetch(url, { signal: controller.signal });
  if (!res.ok) {
    console.error(`stream HTTP ${res.status}`);
    process.exitCode = 1;
  } else {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (!done) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        handleLine(line);
        if (done) {
          await reader.cancel();
          break;
        }
      }
    }
    if (buffer.trim()) handleLine(buffer);
  }
} catch (error) {
  if (error?.name === "AbortError" && events > 0) {
    console.error(`stream timed out after ${timeoutSeconds}s with ${events} events`);
  } else {
    console.error(`stream failed: ${error}`);
  }
  process.exitCode = done ? 0 : 1;
} finally {
  clearTimeout(timer);
  await new Promise((resolve) => out.end(resolve));
}

if (!done && !process.exitCode) {
  console.error("stream ended before completion marker");
  process.exitCode = 1;
}

if (failed) {
  console.error("stream ended with session.failed or turn.failed");
  process.exitCode = 1;
}

if (!process.exitCode) {
  console.log(`stream captured ${events} events`);
}
