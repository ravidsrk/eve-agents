import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ENV_FILENAMES = [".env.local", ".secrets/eve.env"];

/** Anchor dirs to walk when cwd alone is not the agent package root. */
function searchRoots(startDir = process.cwd()) {
  const roots = new Set();
  if (startDir) roots.add(startDir);
  if (process.env.EVE_APP_ROOT) roots.add(process.env.EVE_APP_ROOT);
  if (process.env.INIT_CWD) roots.add(process.env.INIT_CWD);
  try {
    roots.add(dirname(fileURLToPath(import.meta.url)));
  } catch {
    // ignore
  }
  return [...roots];
}

/** Read KEY=VALUE walking up from startDir through common env file names. */
export function readEnvLocalValue(key, startDir = process.cwd()) {
  for (const root of searchRoots(startDir)) {
    let dir = root;
    for (let i = 0; i < 16 && dir !== dirname(dir); i++) {
      for (const name of ENV_FILENAMES) {
        const file = join(dir, name);
        if (!existsSync(file)) continue;
        for (const line of readFileSync(file, "utf8").split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eq = trimmed.indexOf("=");
          if (eq < 1) continue;
          const k = trimmed.slice(0, eq).trim();
          if (k === key) return trimmed.slice(eq + 1).trim();
        }
      }
      dir = dirname(dir);
    }
  }
  return undefined;
}

export function resolveOpenRouterKey(opts = {}) {
  return (
    opts.apiKey ||
    process.env.OPENROUTER_API_KEY ||
    process.env.OPEN_ROUTER_KEY ||
    readEnvLocalValue("OPENROUTER_API_KEY") ||
    readEnvLocalValue("OPEN_ROUTER_KEY")
  );
}