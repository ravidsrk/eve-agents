import { defineTool } from "eve/tools";
import { z } from "zod";

// Safe arithmetic evaluator: digits, operators, parentheses, decimal points, % only.
export default defineTool({
  description: "Evaluate a basic arithmetic expression (e.g. '80 * 0.15').",
  inputSchema: z.object({ expression: z.string().min(1) }),
  async execute({ expression }) {
    if (!/^[\d\s+\-*/().%]+$/.test(expression)) {
      return { error: "Only basic arithmetic is allowed." };
    }
    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expression});`)();
      return { expression, result };
    } catch (e) {
      return { error: String(e) };
    }
  },
});
