/**
 * REL-002: classify NDJSON stream events from eve session capture.
 * Pure helpers so acceptance can be unit-tested without a live HTTP stream.
 */

/**
 * @param {unknown} event
 * @returns {{ terminal: boolean, failed: boolean }}
 */
export function classifyStreamEvent(event) {
  if (!event || typeof event !== "object") {
    return { terminal: false, failed: false };
  }
  const type = event.type;
  if (type === "session.failed" || type === "turn.failed") {
    return { terminal: true, failed: true };
  }
  if (type === "session.waiting" || type === "session.completed") {
    return { terminal: true, failed: false };
  }
  return { terminal: false, failed: false };
}

/**
 * Apply one NDJSON line to capture state.
 * @param {string} line
 * @param {{ events: number, done: boolean, failed: boolean, write?: (line: string) => void }} state
 */
export function handleStreamLine(line, state) {
  if (!line.trim()) return;
  state.events += 1;
  state.write?.(line);
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    return;
  }
  const { terminal, failed } = classifyStreamEvent(event);
  if (terminal) state.done = true;
  if (failed) state.failed = true;
}

/**
 * Final exit code after stream capture ends.
 * @param {{ done: boolean, failed: boolean, exitCode?: number | null }} state
 */
export function streamExitCode(state) {
  if (state.failed) return 1;
  if (!state.done) return 1;
  return state.exitCode && state.exitCode !== 0 ? state.exitCode : 0;
}
