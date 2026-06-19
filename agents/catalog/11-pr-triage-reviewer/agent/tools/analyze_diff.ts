import { readFileSync } from "node:fs";
import path from "node:path";
import { defineTool } from "eve/tools";
import { z } from "zod";

const PATCH_TOKEN = "pr-patch-analyzed-A11";

function loadPatch(customPath?: string): string {
  const file = customPath
    ? path.join(process.cwd(), customPath)
    : path.join(process.cwd(), "agent/data/pr-patch.diff");
  return readFileSync(file, "utf8");
}

function analyzePatch(text: string) {
  const files = [...text.matchAll(/^diff --git a\/(.+?) b\//gm)].map((m) => m[1]);
  const touchesAuth = files.some((f) => f.includes("auth") || f.includes("session"));
  const touchesApi = files.some((f) => f.includes("api/"));
  const riskLabels: string[] = [];
  if (touchesAuth) riskLabels.push("auth-change", "security");
  if (touchesApi) riskLabels.push("api-surface");
  if (text.includes("auditLog")) riskLabels.push("observability");

  const suggestedReviewers = touchesAuth
    ? ["security-team", "platform-oncall"]
    : ["engineering-lead"];

  return {
    token: PATCH_TOKEN,
    filesChanged: files,
    riskLabels,
    summary: touchesAuth
      ? "Auth session decoding changed from legacy token to JWT; review for breakage and token validation."
      : "Routine API change.",
    suggestedReviewers,
    linesAdded: (text.match(/^\+[^+]/gm) ?? []).length,
    linesRemoved: (text.match(/^-[^-]/gm) ?? []).length,
  };
}

export default defineTool({
  description: "Analyze a unified diff for risk labels, changed files, and suggested reviewers.",
  inputSchema: z.object({
    patchPath: z
      .string()
      .optional()
      .describe("Optional path under cwd; defaults to agent/data/pr-patch.diff."),
  }),
  async execute({ patchPath }) {
    const patch = loadPatch(patchPath);
    return analyzePatch(patch);
  },
});