import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

// Side-effecting action gated behind mandatory human approval.
export default defineTool({
  description: "Refund a charge by id. Requires human approval before executing.",
  inputSchema: z.object({
    chargeId: z.string().min(1),
    amount: z.number().positive(),
  }),
  needsApproval: always(),
  async execute({ chargeId, amount }) {
    // Simulated side effect.
    return { chargeId, amount, status: "refunded", refundId: `re_${chargeId}_${Date.now()}` };
  },
});
