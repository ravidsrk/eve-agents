// Minimal same-origin static server + proxy so the browser UI and the eve API share an origin
// (avoids CORS). Serves index.html at /, and proxies /eve/* to the eve dev server.
//
//   node serve.mjs <uiPort> <eveBaseUrl>
//   e.g. node serve.mjs 8080 http://127.0.0.1:3131
import http from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const UI_PORT = Number(process.argv[2] || 8080);
const EVE = process.argv[3] || "http://127.0.0.1:3131";
const __dirname = dirname(fileURLToPath(import.meta.url));

const server = http.createServer(async (req, res) => {
  const path = req.url.split("?")[0];
  if (path === "/" || path === "/index.html") {
    const html = readFileSync(join(__dirname, "index.html"));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(html);
  }
  if (req.url.startsWith("/eve/")) {
    const target = EVE + req.url;
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", async () => {
      try {
        const upstream = await fetch(target, {
          method: req.method,
          headers: { "content-type": req.headers["content-type"] || "application/json" },
          body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks),
        });
        res.writeHead(upstream.status, {
          "content-type": upstream.headers.get("content-type") || "application/json",
        });
        // Stream the body through (works for NDJSON).
        const reader = upstream.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
      } catch (e) {
        res.writeHead(502); res.end("proxy error: " + e);
      }
    });
    return;
  }
  res.writeHead(404); res.end("not found");
});
server.listen(UI_PORT, () => console.log(`[web-ui] http://127.0.0.1:${UI_PORT} -> proxy ${EVE}`));
