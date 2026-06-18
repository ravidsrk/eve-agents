import { defineTool } from "eve/tools";
import { z } from "zod";
import { Sandbox } from "@superserve/sdk";

// Fan out N jobs across N independent SuperServe Firecracker microVMs, in parallel.
// Each job runs its Python snippet in its own VM; VMs are killed after collection.
export default defineTool({
  description:
    "Run several independent Python jobs in parallel, each in its own isolated SuperServe sandbox. " +
    "Returns each job's stdout/exit code.",
  inputSchema: z.object({
    jobs: z
      .array(
        z.object({
          name: z.string().min(1),
          code: z.string().min(1).describe("Self-contained Python snippet that prints its result"),
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
        } catch (e: unknown) {
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
