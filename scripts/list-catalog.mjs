#!/usr/bin/env node
/**
 * Print the unified agent catalog (JSON or markdown).
 * Usage: node scripts/list-catalog.mjs [--format=json|md]
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const format = process.argv.includes("--format=md") ? "md" : "json";

const tiers = [
  {
    id: "reference",
    label: "Reference",
    dir: "agents/reference",
    prefix: "agent-",
    role: "Ported vercel/eve e2e fixtures with evals",
  },
  {
    id: "catalog",
    label: "Real-world catalog",
    dir: "agents/catalog",
    prefix: /^\d{2}-/,
    role: "50 real-world job templates (shared agent-kit tools)",
  },
  {
    id: "production",
    label: "Production depth",
    dir: "agents/production",
    prefix: /^p\d{2}-/,
    role: "10 Monid-integrated deep agents",
    skip: new Set(["_shared", "README.md"]),
  },
  {
    id: "integrations",
    label: "Integrations",
    dir: "agents/integrations",
    prefix: /^\d{2}-/,
    role: "Integration proofs and harnesses — selective reuse",
  },
];

function listTier(tier) {
  const full = path.join(root, tier.dir);
  if (!existsSync(full)) return [];
  return readdirSync(full, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => {
      if (tier.skip?.has(name)) return false;
      if (tier.prefix instanceof RegExp) return tier.prefix.test(name);
      return name.startsWith(tier.prefix);
    })
    .sort()
    .map((id) => {
      const agentDir = path.join(full, id);
      const readme = path.join(agentDir, "README.md");
      const hasLive = existsSync(path.join(agentDir, "run.log"));
      const hasDryRun = existsSync(path.join(agentDir, "evidence", "dry-run.json"));
      const hasEvals = existsSync(path.join(agentDir, "evals"));
      let description = "";
      if (existsSync(readme)) {
        const line = readFileSync(readme, "utf8").split("\n").find((l) => l.trim() && !l.startsWith("#"));
        description = line?.replace(/^\*\*|\*\*$/g, "").trim() ?? "";
      }
      return {
        id,
        path: `${tier.dir}/${id}`,
        description,
        evidence: { live: hasLive, dryRun: hasDryRun, evals: hasEvals },
      };
    });
}

const totals = {};
const tierResults = tiers.map((tier) => {
  const agents = listTier(tier);
  totals[tier.id] = agents.length;
  return { ...tier, agents };
});

const catalog = {
  generatedAt: new Date().toISOString(),
  totals: { ...totals, all: Object.values(totals).reduce((a, b) => a + b, 0) },
  tiers: tierResults,
};

if (format === "md") {
  const lines = ["# Agent catalog index", "", `Generated: ${catalog.generatedAt}`, ""];
  for (const tier of catalog.tiers) {
    lines.push(`## ${tier.label} (${tier.agents.length})`, "", `_${tier.role}_`, "");
    lines.push("| ID | Path | Live | Evals |");
    lines.push("| --- | --- | :---: | :---: |");
    for (const a of tier.agents) {
      lines.push(
        `| \`${a.id}\` | [\`${a.path}\`](${a.path}) | ${a.evidence.live ? "yes" : "—"} | ${a.evidence.evals ? "yes" : "—"} |`,
      );
    }
    lines.push("");
  }
  lines.push(`**Total agents:** ${catalog.totals.all}`);
  console.log(lines.join("\n"));
} else {
  console.log(JSON.stringify(catalog, null, 2));
}