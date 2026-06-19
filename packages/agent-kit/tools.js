import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { Sandbox } from "@superserve/sdk";
import { z } from "zod";

function appRoot() {
  return process.cwd();
}

function readJson(relativePath, fallback) {
  const file = path.join(appRoot(), relativePath);
  if (!existsSync(file)) return fallback;
  return JSON.parse(readFileSync(file, "utf8"));
}

function agentSlug() {
  const pkg = readJson("package.json", { name: "agent" });
  return String(pkg.name || "agent").replace(/^arch-\d+-/, "");
}

function textIncludes(value, query) {
  return JSON.stringify(value).toLowerCase().includes(query.toLowerCase());
}

function scoreRecord(record) {
  const text = JSON.stringify(record).toLowerCase();
  let risk = 0;
  let opportunity = 0;
  for (const word of ["blocked", "critical", "late", "breach", "failed", "high", "urgent", "security", "legal"]) {
    if (text.includes(word)) risk += 2;
  }
  for (const word of ["revenue", "savings", "growth", "expansion", "retention", "automation", "priority"]) {
    if (text.includes(word)) opportunity += 2;
  }
  const explicitRisk = Number(record.risk ?? record.riskScore ?? record.severity ?? 0);
  const explicitImpact = Number(record.impact ?? record.value ?? record.amount ?? 0);
  if (Number.isFinite(explicitRisk)) risk += explicitRisk;
  if (Number.isFinite(explicitImpact)) opportunity += Math.min(Math.abs(explicitImpact) / 10000, 5);
  return { risk: Math.round(risk * 10) / 10, opportunity: Math.round(opportunity * 10) / 10 };
}

export const loadDossierTool = defineTool({
  description: "Load this agent's local dossier: role, workflow, sample data notes, policies, and expected deliverables.",
  inputSchema: z.object({
    section: z.string().optional().describe("Optional top-level dossier section to return."),
  }),
  async execute({ section }) {
    const dossier = readJson("agent/data/dossier.json", {});
    if (section) return { section, value: dossier[section] ?? null, availableSections: Object.keys(dossier) };
    return dossier;
  },
});

export const searchRecordsTool = defineTool({
  description: "Search this agent's local records by free-text query and return matching operational records.",
  inputSchema: z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(50).default(10),
  }),
  async execute({ query, limit }) {
    const records = readJson("agent/data/records.json", []);
    const matches = records.filter((record) => textIncludes(record, query)).slice(0, limit);
    return { query, count: matches.length, records: matches };
  },
});

export const analyzeRecordsTool = defineTool({
  description: "Score local records for operational risk and opportunity, returning ranked items and aggregate counts.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(50).default(10),
  }),
  async execute({ limit }) {
    const records = readJson("agent/data/records.json", []);
    const scored = records
      .map((record) => ({ ...record, score: scoreRecord(record) }))
      .sort((a, b) => (b.score.risk + b.score.opportunity) - (a.score.risk + a.score.opportunity));
    const totals = scored.reduce(
      (acc, item) => {
        acc.risk += item.score.risk;
        acc.opportunity += item.score.opportunity;
        return acc;
      },
      { risk: 0, opportunity: 0 },
    );
    return {
      totalRecords: records.length,
      totals: {
        risk: Math.round(totals.risk * 10) / 10,
        opportunity: Math.round(totals.opportunity * 10) / 10,
      },
      topRecords: scored.slice(0, limit),
    };
  },
});

export const writeReportTool = defineTool({
  description: "Write a markdown report artifact for the current agent task and return the local path.",
  inputSchema: z.object({
    filename: z.string().min(1).default("report.md"),
    title: z.string().min(1),
    markdown: z.string().min(1),
  }),
  async execute({ filename, title, markdown }) {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+/, "") || "report.md";
    const dir = path.join(appRoot(), ".agent-artifacts", agentSlug());
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, safeName.endsWith(".md") ? safeName : `${safeName}.md`);
    const body = `# ${title}\n\n${markdown.trim()}\n`;
    writeFileSync(file, body);
    return { path: file, bytes: Buffer.byteLength(body), title };
  },
});

export const recordDecisionTool = defineTool({
  description: "Record a simulated external action. Requires human approval because it represents a side effect.",
  inputSchema: z.object({
    action: z.string().min(1),
    target: z.string().min(1),
    reason: z.string().min(1),
  }),
  needsApproval: always(),
  async execute({ action, target, reason }) {
    const entry = { action, target, reason, status: "recorded", at: new Date().toISOString() };
    const dir = path.join(appRoot(), ".agent-artifacts", agentSlug());
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "decisions.jsonl");
    writeFileSync(file, `${JSON.stringify(entry)}\n`, { flag: "a" });
    return entry;
  },
});

export const fetchLiveJsonTool = defineTool({
  description:
    "Fetch JSON from an HTTPS endpoint when live data is needed. External fetching is disabled unless ALLOW_EXTERNAL_FETCH=1.",
  inputSchema: z.object({
    url: z.string().url(),
  }),
  async execute({ url }) {
    if (process.env.ALLOW_EXTERNAL_FETCH !== "1") {
      return {
        blocked: true,
        reason: "Set ALLOW_EXTERNAL_FETCH=1 to enable live network fetches for this tool.",
        url,
      };
    }
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return { blocked: true, reason: "Only HTTPS URLs are allowed.", url };
    }
    const res = await fetch(url, { headers: { accept: "application/json" } });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text.slice(0, 5000) };
    }
    return { status: res.status, ok: res.ok, url, json };
  },
});

/** Parallel isolated SuperServe sandboxes — extracted from integrations/20-swarm. */
export const swarmRunTool = defineTool({
  description:
    "Run independent Python jobs in parallel, each in its own isolated SuperServe sandbox. " +
    "Returns stdout and exit code per job.",
  inputSchema: z.object({
    jobs: z
      .array(
        z.object({
          name: z.string().min(1),
          code: z.string().min(1).describe("Self-contained Python that prints its result"),
        }),
      )
      .min(1)
      .max(6),
  }),
  async execute({ jobs }) {
    const started = Date.now();
    const results = await Promise.all(
      jobs.map(async (job) => {
        let sandbox;
        try {
          sandbox = await Sandbox.create({
            name: `swarm-${job.name}`.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 50),
            fromTemplate: "superserve/python-ml",
            timeoutSeconds: 300,
          });
          await sandbox.files.write("/workspace/job.py", job.code);
          const r = await sandbox.commands.run("python3 /workspace/job.py", { timeoutMs: 60000 });
          return {
            name: job.name,
            sandboxId: sandbox.id,
            exitCode: r.exitCode,
            stdout: r.stdout.trim(),
            stderr: r.stderr.trim().slice(0, 500),
          };
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return { name: job.name, error: msg };
        } finally {
          if (sandbox) await sandbox.kill().catch(() => {});
        }
      }),
    );
    return { jobCount: jobs.length, elapsedMs: Date.now() - started, results };
  },
});

