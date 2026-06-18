import { defineSandbox } from "eve/sandbox";
import { superserveBackend } from "@lab/superserve-backend";

// Run the agent's sandbox on SuperServe Firecracker microVMs.
// python-ml ships python3 + pandas/numpy; the VM auto-pauses when idle and
// resumes (filesystem intact) on the next turn.
export default defineSandbox({
  backend: superserveBackend({
    fromTemplate: "superserve/python-ml",
    timeoutSeconds: 1800,
  }),
});
