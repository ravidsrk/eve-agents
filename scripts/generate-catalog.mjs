#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalogDir = path.join(root, "agents", "catalog");
const customizedMarker = ".generated=false";

const agents = [
  ["01", "revenue-analyst", "Revenue analyst", "Finance", "Answers KPI/revenue questions from a warehouse extract and explains assumptions.", ["finance", "analytics"], "Use the revenue recognition skill before answering revenue questions."],
  ["02", "sales-lead-researcher", "Sales lead researcher", "Sales", "Enriches inbound leads, scores fit, and drafts next-best action.", ["sales", "research"], "Separate verified facts from hypotheses when using live research."],
  ["03", "crm-hygiene-auditor", "CRM hygiene auditor", "RevOps", "Finds duplicate accounts, stale owners, and missing lifecycle fields.", ["crm", "operations"], "Never propose destructive CRM changes without approval."],
  ["04", "support-ticket-triage", "Support ticket triage", "Support", "Classifies tickets, finds likely answer paths, and escalates risk.", ["support", "triage"], "Escalate billing, legal, security, and data-loss tickets."],
  ["05", "refund-approval-operator", "Refund approval operator", "Support Ops", "Applies refund policy and gates side-effecting refunds behind HITL approval.", ["support", "approvals"], "Use record_decision only after the policy decision is clear."],
  ["06", "incident-commander", "Incident commander", "SRE", "Builds an incident timeline and next-action checklist from alerts/logs.", ["incident", "sre"], "Prioritize containment, customer impact, owner, and next update time."],
  ["07", "oncall-runbook-executor", "On-call runbook executor", "SRE", "Executes safe diagnostics and writes an operator handoff.", ["sre", "runbook"], "Diagnostics are read-only unless a human approves a side effect."],
  ["08", "cloud-cost-optimizer", "Cloud cost optimizer", "Platform", "Finds avoidable spend and proposes low-risk savings actions.", ["cost", "finops"], "Distinguish rightsizing, deletion, reservation, and architecture changes."],
  ["09", "security-cve-triager", "Security CVE triager", "Security", "Maps CVEs to affected services and prioritizes remediation.", ["security", "cve"], "Do not downplay externally reachable or auth-bypass risk."],
  ["10", "dependency-upgrade-planner", "Dependency upgrade planner", "Engineering", "Plans package upgrades with risk, tests, and rollback steps.", ["engineering", "dependencies"], "Prefer small reversible upgrade batches."],
  ["11", "pr-triage-reviewer", "PR triage reviewer", "Engineering", "Summarizes diffs, labels risk, and suggests reviewers.", ["github", "review"], "Credit the Vercel PR triage template pattern in the README."],
  ["12", "code-review-risk-assessor", "Code review risk assessor", "Engineering", "Reviews a patch for correctness, security, and test gaps.", ["review", "quality"], "Findings must reference file paths or patch hunks when possible."],
  ["13", "release-notes-drafter", "Release notes drafter", "Product Marketing", "Turns merged changes into customer-facing release notes.", ["release", "content"], "Separate customer-facing notes from internal implementation details."],
  ["14", "migration-planner", "Migration planner", "Engineering", "Converts legacy API/code inventory into an execution plan.", ["migration", "planning"], "Stage migrations by blast radius and rollback availability."],
  ["15", "test-failure-debugger", "Test failure debugger", "Engineering", "Reads failing logs, identifies likely cause, and proposes a fix.", ["testing", "debugging"], "Never claim a fix without naming the validation command."],
  ["16", "documentation-qa", "Documentation QA", "Developer Relations", "Audits docs for broken promises, stale commands, and missing prerequisites.", ["docs", "qa"], "Mark each issue as factual bug, ambiguity, missing prerequisite, or stale example."],
  ["17", "content-pipeline-agent", "Content pipeline agent", "Content", "Drafts blog/social/newsletter copy from source notes and style rules.", ["content", "notion"], "Follow the content-agent template's source-grounded approval pipeline."],
  ["18", "brand-voice-reviewer", "Brand voice reviewer", "Marketing", "Lints copy against tone, banned phrases, and evidence requirements.", ["brand", "copy"], "Prefer precise edits over vague style advice."],
  ["19", "social-sentiment-monitor", "Social sentiment monitor", "Growth", "Clusters social posts and reports sentiment/drivers.", ["social", "sentiment"], "Do not infer demographics or protected traits."],
  ["20", "competitor-intelligence-brief", "Competitor intelligence brief", "Strategy", "Produces sourced competitor/product movement summaries.", ["strategy", "research"], "Label source gaps and stale evidence explicitly."],
  ["21", "market-news-briefing", "Market/news briefing", "Strategy", "Generates daily sector brief with confidence and source gaps.", ["news", "schedule"], "Use concise bullets with impact and confidence."],
  ["22", "finance-kpi-analyst", "Finance KPI analyst", "Finance", "Analyzes margin, cash, runway, and anomalies.", ["finance", "kpi"], "State formula and period for every metric."],
  ["23", "invoice-anomaly-auditor", "Invoice anomaly auditor", "Finance Ops", "Flags suspicious invoices and missing approvals.", ["finance", "audit"], "Do not accuse fraud; state anomaly evidence and review steps."],
  ["24", "procurement-vendor-comparer", "Procurement vendor comparer", "Procurement", "Scores vendors against requirements, risk, and cost.", ["procurement", "vendor"], "Separate hard requirements from weighted preferences."],
  ["25", "contract-clause-reviewer", "Contract clause reviewer", "Legal Ops", "Finds risky clauses and drafts review questions.", ["legal", "contracts"], "This is triage, not legal advice; route final judgment to counsel."],
  ["26", "compliance-policy-checker", "Compliance policy checker", "Compliance", "Checks proposed actions against a controls matrix.", ["compliance", "controls"], "Map every concern to a named control."],
  ["27", "privacy-dsr-responder", "Privacy DSR responder", "Privacy", "Builds data-subject request task plans without exposing sensitive data.", ["privacy", "dsr"], "Minimize personal data and use placeholders in reports."],
  ["28", "hr-onboarding-assistant", "HR onboarding assistant", "People Ops", "Creates onboarding plans and tracks missing setup tasks.", ["hr", "onboarding"], "Avoid sensitive personal judgments; focus on tasks and resources."],
  ["29", "recruiting-resume-screener", "Recruiting resume screener", "Recruiting", "Screens resumes against job criteria with fairness guardrails.", ["recruiting", "fairness"], "Use only job-related criteria and avoid protected-class inferences."],
  ["30", "employee-it-helpdesk", "Employee IT helpdesk", "IT", "Diagnoses access/device issues and drafts escalation packets.", ["it", "helpdesk"], "Ask for missing environment details before speculative fixes."],
  ["31", "access-request-approver", "Access request approver", "Security", "Checks access requests against least-privilege policy and requires approval.", ["security", "iam"], "Any grant is a side effect and must use approval."],
  ["32", "knowledge-base-maintainer", "Knowledge base maintainer", "Support Ops", "Finds KB gaps from recurring tickets and drafts article updates.", ["kb", "support"], "Prefer new article/update/delete recommendations with evidence."],
  ["33", "rag-support-search", "RAG support search", "Support", "Retrieves grounded support answers from a document set.", ["rag", "support"], "Quote document titles/ids and say when the answer is not in the corpus."],
  ["34", "product-feedback-synthesizer", "Product feedback synthesizer", "Product", "Clusters feedback into themes, severity, and roadmap asks.", ["product", "feedback"], "Do not let volume override severity without saying so."],
  ["35", "roadmap-prioritizer", "Roadmap prioritizer", "Product", "Scores initiatives by impact, confidence, effort, and risk.", ["product", "roadmap"], "Show scoring assumptions and sensitivity."],
  ["36", "experiment-analyst", "Experiment analyst", "Growth", "Reviews A/B results and recommends ship/iterate/stop.", ["analytics", "experiments"], "Report sample size, lift, uncertainty, and guardrail metrics."],
  ["37", "etl-data-quality-monitor", "ETL data quality monitor", "Data", "Detects schema drift, null spikes, and late data.", ["data", "etl"], "Classify each incident by freshness, completeness, validity, or schema."],
  ["38", "data-catalog-steward", "Data catalog steward", "Data Governance", "Documents datasets, owners, freshness, and PII flags.", ["data", "catalog"], "Flag missing owner, freshness SLA, or PII classification."],
  ["39", "code-interpreter-analyst", "Code interpreter analyst", "Analytics", "Runs ad-hoc Python analysis over uploaded data.", ["python", "analysis"], "Use sandbox code for calculations instead of mental math."],
  ["40", "pdf-due-diligence-analyst", "PDF due diligence analyst", "Corporate Development", "Extracts issues and questions from diligence documents.", ["pdf", "diligence"], "Separate direct evidence from follow-up questions."],
  ["41", "insurance-claims-triage", "Insurance claims triage", "Insurance Ops", "Prioritizes claims, missing evidence, and fraud indicators.", ["insurance", "claims"], "Do not deny claims; route high-risk cases to licensed reviewers."],
  ["42", "healthcare-intake-summarizer", "Healthcare intake summarizer", "Healthcare Ops", "Summarizes intake for staff without diagnosis or treatment advice.", ["healthcare", "intake"], "No diagnosis, treatment, or medication advice."],
  ["43", "travel-operations-assistant", "Travel operations assistant", "Travel Ops", "Handles itinerary disruption options and traveler comms.", ["travel", "ops"], "Prioritize safety, policy compliance, and clear traveler choices."],
  ["44", "logistics-exception-monitor", "Logistics exception monitor", "Logistics", "Explains delayed shipments and proposes mitigation.", ["logistics", "shipments"], "Name the bottleneck, customer impact, and mitigation owner."],
  ["45", "ecommerce-merchandising-analyst", "Ecommerce merchandising analyst", "Commerce", "Finds assortment/pricing/review issues by SKU.", ["ecommerce", "merchandising"], "Separate pricing, content, review, and availability issues."],
  ["46", "inventory-replenishment-planner", "Inventory replenishment planner", "Operations", "Recommends reorder actions from demand and lead time.", ["inventory", "planning"], "Explain stockout risk and carrying-cost tradeoff."],
  ["47", "real-estate-comp-analyst", "Real estate comp analyst", "Real Estate", "Compares properties and flags valuation caveats.", ["real-estate", "comps"], "State adjustment assumptions and uncertainty."],
  ["48", "education-tutor-planner", "Education tutor planner", "Education", "Builds lesson plans and rubric feedback with safety bounds.", ["education", "tutoring"], "Give feedback on work, not personal traits."],
  ["49", "research-literature-mapper", "Research literature mapper", "Research", "Clusters papers, claims, methods, and open questions.", ["research", "papers"], "Do not invent citations; mark source gaps."],
  ["50", "agent-fleet-router", "Agent fleet router", "Operations", "Routes incoming tasks to the right specialized agent and explains why.", ["routing", "fleet"], "Use the registry before choosing a route."],
];

function parseRange() {
  const idx = process.argv.indexOf("--range");
  if (idx === -1) return [1, agents.length];
  const [a, b = a] = process.argv[idx + 1].split("-").map((n) => Number(n));
  return [a, b];
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function write(file, content) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function packageJson(spec) {
  const [, slug, title] = spec;
  return json({
    name: `arch-${spec[0]}-${slug}`,
    version: "0.0.0",
    type: "module",
    private: true,
    description: `${title}: ${spec[4]}`,
    imports: {
      "#*": "./agent/*",
      "#evals/*": "./evals/*",
    },
    scripts: {
      dev: "eve dev",
      build: "eve build",
      start: "eve start",
      typecheck: "tsgo",
      "test:evals": "eve eval --strict",
    },
    dependencies: {
      "@ai-sdk/openai-compatible": "3.0.0-beta.57",
      "@eve-catalog/profile": "*",
      "@eve-catalog/openrouter": "*",
      "@eve-catalog/superserve-backend": "*",
      "@eve-catalog/monid-tools": "*",
      "@eve-catalog/agent-kit": "*",
      ai: "7.0.0-beta.178",
      eve: "^0.11.4",
      zod: "4.4.3",
    },
    devDependencies: {
      "@types/node": "24.x",
      "@typescript/native-preview": "7.0.0-dev.20260523.1",
    },
    engines: { node: "24.x" },
  });
}

function tsconfig() {
  return json({
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      types: ["node"],
      skipLibCheck: true,
      noEmit: true,
      allowImportingTsExtensions: true,
    },
    include: ["agent/**/*.ts", "evals/**/*.ts"],
  });
}

function agentTs() {
  return `import { defineAgent } from "eve";
import { DEFAULT_CONTEXT_WINDOW, resolveModel } from "@eve-catalog/profile";

export default defineAgent({
  model: resolveModel(),
  modelContextWindowTokens: DEFAULT_CONTEXT_WINDOW,
});
`;
}

function eveChannelTs() {
  return `import { eveChannel } from "eve/channels/eve";
import { catalogRouteAuth } from "@eve-catalog/agent-kit/route-auth";

export default eveChannel({
  auth: catalogRouteAuth(),
});
`;
}

function sandboxTs() {
  return `import { defineSandbox } from "eve/sandbox";
import { resolveSandboxDefinition } from "@eve-catalog/profile";

export default defineSandbox(
  resolveSandboxDefinition({
    superserve: {
      fromTemplate: "superserve/python-ml",
      timeoutSeconds: 1800,
    },
  }),
);
`;
}

function instructions(spec) {
  const [num, slug, title, owner, job, tags, rule] = spec;
  return `You are ${title}, an eve agent for ${owner}.

Mission: ${job}

Operating rules:
- Start by loading the local dossier with \`load_dossier\`.
- Use \`search_records\` or \`analyze_records\` before making claims about the provided records.
- Use sandbox file/code tools when calculations need verification.
- Write durable markdown output with \`write_report\` when the user asks for a deliverable.
- Use \`record_decision\` only for simulated external side effects; it requires human approval.
- ${rule}
- Be explicit about evidence, uncertainty, assumptions, and next actions.
- Never expose secrets. Never claim live external verification unless a live tool actually ran.

Domain tags: ${tags.join(", ")}
Agent id: ${num}-${slug}
`;
}

function skill(spec) {
  const [, slug, title, owner, job, tags, rule] = spec;
  return `---
description: Operating playbook for ${title}. Load when planning, triaging, or writing recommendations.
---

# ${title} playbook

## User
${owner}

## Job
${job}

## Default workflow

1. Load the dossier and identify the request type.
2. Inspect the relevant records; do not rely on memory.
3. Rank work by user impact, financial impact, security/compliance risk, and reversibility.
4. Produce an answer with:
   - decision or recommendation,
   - evidence,
   - assumptions,
   - risks,
   - next action owner,
   - validation or follow-up command.
5. For side effects, ask for approval through \`record_decision\`.

## Domain-specific rule
${rule}

## Tags
${tags.join(", ")}
`;
}

function profileTs(spec) {
  const [num, slug, title, owner, job, tags, rule] = spec;
  return `// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: ${JSON.stringify(`${num}-${slug}`)},
  title: ${JSON.stringify(title)},
  owner: ${JSON.stringify(owner)},
  job: ${JSON.stringify(job)},
  rule: ${JSON.stringify(rule)},
  tags: ${JSON.stringify(tags)},
} as const;
`;
}

function runtimeTs() {
  return `// Dual-track runtime: AI Gateway on Vercel, OpenRouter + SuperServe locally.
export {
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_VERCEL_MODEL,
  isVercelRuntime,
  resolveModel,
  resolveSandboxDefinition,
  resolveSuperserveBackend,
  shouldUseSuperserve,
} from "@eve-catalog/profile";
`;
}

function agentsMd(spec) {
  const [num, slug, title] = spec;
  return `# ${title}

This project is an Eve agent app generated from the real-world catalog.

Before changing code:

1. Read \`agent/instructions.md\`.
2. Read \`agent/skills/operating-playbook/SKILL.md\`.
3. Keep the official Eve filesystem shape: \`agent/agent.ts\`, \`agent/channels/\`, \`agent/tools/\`,
   \`agent/skills/\`, \`agent/lib/\`, and \`agent/sandbox/\`.
4. Never commit \`.env.local\` or captured secrets.

Agent id: ${num}-${slug}
`;
}

function claudeMd(spec) {
  const [, , title] = spec;
  return `# ${title}

This repo follows the Vercel Eve template shape. Prefer small focused changes,
keep tools typed, and validate with \`npm run typecheck --workspace $(node -p "require('./package.json').name")\`.
`;
}

function envExample() {
  return `OPENROUTER_API_KEY=
OPEN_ROUTER_KEY=
OPENROUTER_MODEL=openai/gpt-oss-120b
SUPERSERVE_API_KEY=
MONID_API_KEY=
VERCEL_API_KEY=
VERCEL_TOKEN=
ROUTE_AUTH_BASIC_USER=
ROUTE_AUTH_BASIC_PASSWORD=
ALLOW_EXTERNAL_FETCH=0
`;
}

function vercelIgnore() {
  return `.env
.env.*
.secrets/
node_modules/
.agent-artifacts/
evidence/*.local.json
`;
}

function records(spec) {
  const [num, slug, title, owner, job, tags] = spec;
  return [
    {
      id: `${num}-A`,
      title: `${title} priority case`,
      owner,
      status: "urgent",
      impact: 42000 + Number(num) * 317,
      risk: (Number(num) % 5) + 2,
      summary: `${job} This sample record represents the highest-impact open item.`,
      tags,
    },
    {
      id: `${num}-B`,
      title: `${title} routine queue item`,
      owner,
      status: "in_review",
      impact: 9000 + Number(num) * 113,
      risk: (Number(num) % 3) + 1,
      summary: `Lower-risk operational item for ${slug}; useful for comparison and prioritization.`,
      tags,
    },
    {
      id: `${num}-C`,
      title: `${title} blocked follow-up`,
      owner,
      status: "blocked",
      impact: 18000 + Number(num) * 211,
      risk: (Number(num) % 4) + 3,
      summary: `Blocked work requiring cross-functional coordination before the agent can safely recommend action.`,
      tags,
    },
  ];
}

function dossier(spec) {
  const [num, slug, title, owner, job, tags, rule] = spec;
  return {
    id: `${num}-${slug}`,
    title,
    owner,
    job,
    rule,
    tags,
    sourceInspiredBy: [
      "https://vercel.com/blog/introducing-eve",
      "https://github.com/vercel/eve",
      "https://github.com/vercel-labs/eve-content-agent-template",
      "https://github.com/vercel-labs/personal-agent-template",
      "https://github.com/vercel-labs/eve-pr-triage-agent-template",
    ],
    evidenceRequired: [
      "loaded dossier",
      "searched or analyzed records",
      "named assumptions",
      "side effects gated by approval",
    ],
    samplePrompt: `Review the current ${title.toLowerCase()} queue and write a prioritized action report.`,
    liveIntegrations: {
      openrouter: "Model inference through @eve-catalog/openrouter when OPENROUTER_API_KEY is configured.",
      superserve: "Sandbox execution through @eve-catalog/superserve-backend when SUPERSERVE_API_KEY is configured.",
      monid: "Optional live tool discovery/run when MONID_API_KEY is valid.",
    },
  };
}

function readme(spec) {
  const [num, slug, title, owner, job, tags, rule] = spec;
  const port = `32${num}`;
  return `# ${title}

## Rationale

${title} is a real-world eve archetype for ${owner}.

Mission: ${job}

This is not a toy feature demo: it has a bounded user, local operational records, a playbook skill,
approval-gated side effects, and report output.

## Template shape

This archetype follows the official Eve template layout:

- root \`AGENTS.md\`, \`CLAUDE.md\`, \`.env.example\`, and \`.vercelignore\`,
- \`agent/agent.ts\` for model/runtime configuration,
- \`agent/channels/eve.ts\` for the default authenticated Eve HTTP/TUI channel,
- \`agent/instructions.md\` for always-on behavior,
- \`agent/skills/operating-playbook/SKILL.md\` for domain procedure,
- \`agent/lib/profile.ts\` for reusable static metadata,
- \`agent/tools/*.ts\` for typed tools,
- \`agent/sandbox/sandbox.ts\` for SuperServe-backed execution.

## Run

\`\`\`bash
bash ../../scripts/run-catalog-agent.sh agents/catalog/${num}-${slug} ${port} "Review the current ${title.toLowerCase()} queue and write a prioritized action report."
\`\`\`

Requires:

- \`OPENROUTER_API_KEY\` for model inference.
- \`SUPERSERVE_API_KEY\` for sandbox-backed eve file/code execution.
- Optional valid \`MONID_API_KEY\` for live external research in follow-up work.

## Tools and data

- \`load_dossier\`: loads \`agent/data/dossier.json\`.
- \`search_records\`: searches \`agent/data/records.json\`.
- \`analyze_records\`: scores local records for risk and opportunity.
- \`write_report\`: writes a markdown artifact under \`.agent-artifacts/\`.
- \`record_decision\`: approval-gated simulated side effect.
- \`fetch_live_json\`: guarded HTTPS JSON fetch, disabled unless \`ALLOW_EXTERNAL_FETCH=1\`.

## Sample prompt

> Review the current ${title.toLowerCase()} queue and write a prioritized action report.

## Expected behavior

The agent should load the dossier, inspect records, identify the highest-priority item, state
assumptions and uncertainty, and write a report. For any action that changes an external system, it
must use \`record_decision\`, which pauses for human approval.

## Evidence status

- Deterministic fixtures: included in \`agent/data/\`.
- Live OpenRouter/SuperServe run: pending until those keys are available in this workspace.
- Monid live research: pending because the currently available Monid key is rejected by the API.

## Domain rule

${rule}

## Tags

${tags.join(", ")}
`;
}

function dryRun(spec) {
  const [num, slug, title] = spec;
  return json({
    agent: `${num}-${slug}`,
    samplePrompt: `Review the current ${title.toLowerCase()} queue and write a prioritized action report.`,
    expectedToolSequence: ["load_dossier", "analyze_records", "write_report"],
    approvalExpectedForSideEffects: true,
    liveStatus: "pending OpenRouter and SuperServe keys",
  });
}

function agentDir(spec) {
  const [num, slug] = spec;
  return path.join(catalogDir, `${num}-${slug}`);
}

function isCustomizedAgent(spec) {
  return existsSync(path.join(agentDir(spec), customizedMarker));
}

function generatedPaths(spec) {
  const toolFiles = [
    "load_dossier",
    "search_records",
    "analyze_records",
    "write_report",
    "record_decision",
    "fetch_live_json",
  ];
  return [
    "package.json",
    "tsconfig.json",
    ".env.example",
    ".vercelignore",
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    "agent/agent.ts",
    "agent/channels/eve.ts",
    "agent/instructions.md",
    "agent/skills/operating-playbook/SKILL.md",
    "agent/lib/profile.ts",
    "agent/lib/runtime.ts",
    "agent/sandbox/sandbox.ts",
    "agent/data/dossier.json",
    "agent/data/records.json",
    "evidence/dry-run.json",
    ...toolFiles.map((file) => `agent/tools/${file}.ts`),
    "evals/evals.config.ts",
    "evals/smoke-dossier.eval.ts",
  ];
}

function cleanAgent(spec) {
  const dir = agentDir(spec);
  for (const rel of generatedPaths(spec)) {
    const file = path.join(dir, rel);
    if (existsSync(file)) rmSync(file, { force: true });
  }
}

function cleanCatalog(start, end) {
  mkdirSync(catalogDir, { recursive: true });

  const knownIds = new Set(agents.map(([num, slug]) => `${num}-${slug}`));
  for (const entry of readdirSync(catalogDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d{2}-/.test(entry.name)) continue;
    if (knownIds.has(entry.name)) continue;
    const full = path.join(catalogDir, entry.name);
    if (existsSync(path.join(full, customizedMarker))) continue;
    rmSync(full, { recursive: true, force: true });
  }

  for (const spec of agents) {
    const n = Number(spec[0]);
    if (n < start || n > end) continue;
    if (isCustomizedAgent(spec)) {
      console.log(`skip clean ${spec[0]}-${spec[1]} (${customizedMarker})`);
      continue;
    }
    cleanAgent(spec);
  }
}

function writeAgent(spec) {
  const [num, slug] = spec;
  const dir = agentDir(spec);
  write(path.join(dir, "package.json"), packageJson(spec));
  write(path.join(dir, "tsconfig.json"), tsconfig());
  write(path.join(dir, ".env.example"), envExample());
  write(path.join(dir, ".vercelignore"), vercelIgnore());
  write(path.join(dir, "AGENTS.md"), agentsMd(spec));
  write(path.join(dir, "CLAUDE.md"), claudeMd(spec));
  write(path.join(dir, "README.md"), readme(spec));
  write(path.join(dir, "agent", "agent.ts"), agentTs(spec));
  write(path.join(dir, "agent", "channels", "eve.ts"), eveChannelTs());
  write(path.join(dir, "agent", "instructions.md"), instructions(spec));
  write(path.join(dir, "agent", "skills", "operating-playbook", "SKILL.md"), skill(spec));
  write(path.join(dir, "agent", "lib", "profile.ts"), profileTs(spec));
  write(path.join(dir, "agent", "lib", "runtime.ts"), runtimeTs());
  write(path.join(dir, "agent", "sandbox", "sandbox.ts"), sandboxTs());
  write(path.join(dir, "agent", "data", "dossier.json"), json(dossier(spec)));
  write(path.join(dir, "agent", "data", "records.json"), json(records(spec)));
  write(path.join(dir, "evidence", "dry-run.json"), dryRun(spec));
  const toolMap = {
    load_dossier: "loadDossierTool",
    search_records: "searchRecordsTool",
    analyze_records: "analyzeRecordsTool",
    write_report: "writeReportTool",
    record_decision: "recordDecisionTool",
    fetch_live_json: "fetchLiveJsonTool",
  };
  for (const [file, exportName] of Object.entries(toolMap)) {
    write(path.join(dir, "agent", "tools", `${file}.ts`), `export { ${exportName} as default } from "@eve-catalog/agent-kit/tools";\n`);
  }
  write(
    path.join(dir, "evals", "evals.config.ts"),
    `import { defineEvalConfig } from "eve/evals";

export default defineEvalConfig({});
`,
  );
  write(path.join(dir, "evals", "smoke-dossier.eval.ts"), smokeDossierEval(spec));
}

function smokeDossierEval(spec) {
  const [, slug, title] = spec;
  return `import { defineEval } from "eve/evals";

export default defineEval({
  description: "Smoke: ${title} loads dossier and completes a turn.",
  async test(t) {
    await t.send(
      [
        "Follow these steps exactly:",
        "1. Call load_dossier.",
        "2. Call analyze_records with query 'priority'.",
        "3. Reply with the word DOSSIER-OK on its own line.",
      ].join(${JSON.stringify("\n")}),
    );
    t.completed();
    t.didNotFail();
    t.calledTool("load_dossier");
    t.calledTool("analyze_records");
    t.messageIncludes("DOSSIER-OK");
  },
});
`;
}

const [start, end] = parseRange();

if (hasFlag("--clean")) {
  cleanCatalog(start, end);
}

for (const spec of agents) {
  const n = Number(spec[0]);
  if (n < start || n > end) continue;
  if (isCustomizedAgent(spec)) {
    console.log(`skip generate ${spec[0]}-${spec[1]} (${customizedMarker})`);
    continue;
  }
  writeAgent(spec);
}

console.log(`generated archetypes ${String(start).padStart(2, "0")}-${String(end).padStart(2, "0")}`);
