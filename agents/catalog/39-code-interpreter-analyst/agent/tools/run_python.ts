import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description:
    "Sum integers by writing and executing a Python script in the sandbox. Call when analysis needs verified computation.",
  inputSchema: z.object({
    numbers: z.array(z.number().int()).min(1).describe("Integers to sum."),
  }),
  async execute({ numbers }, ctx) {
    const sandbox = await ctx.getSandbox();
    const script = [
      "import json",
      `nums = json.loads(${JSON.stringify(JSON.stringify(numbers))})`,
      "print(sum(nums))",
      "",
    ].join("\n");
    const scriptPath = "run_python_sum.py";
    await sandbox.writeTextFile({ path: scriptPath, content: script });
    const result = await sandbox.run({ command: `python ${sandbox.resolvePath(scriptPath)}` });
    if (result.exitCode !== 0) {
      throw new Error(`run_python: python exited ${result.exitCode}: ${result.stderr}`);
    }
    return { sum: Number.parseInt(result.stdout.trim(), 10) };
  },
});