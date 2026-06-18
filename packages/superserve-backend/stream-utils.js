// Minimal byte-stream helpers (mirrors eve's internal sandbox stream-utils).

export function bufferToStream(bytes) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

export async function streamToBuffer(stream) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
    chunks.push(chunk);
    total += chunk.byteLength;
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.byteLength;
  }
  return out;
}

export async function collectStreamToString(stream) {
  return new TextDecoder().decode(await streamToBuffer(stream));
}

// 1-based inclusive line range, preserving line endings (mirrors eve).
export function applyLineRange(text, startLine, endLine) {
  if (startLine === undefined && endLine === undefined) return text;
  const lines = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") {
      lines.push(text.slice(start, i + 1));
      start = i + 1;
    }
  }
  if (start < text.length) lines.push(text.slice(start));
  const n = lines.length;
  const s = startLine ?? 1;
  const e = Math.min(endLine ?? n, n);
  if (s > n) return "";
  return lines.slice(s - 1, e).join("");
}
