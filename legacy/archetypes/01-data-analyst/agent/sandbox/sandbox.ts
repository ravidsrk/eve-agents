import { defineSandbox } from "eve/sandbox";
import { superserveBackend } from "@lab/superserve-backend";

// python-ml ships pandas/numpy. Seed files under sandbox/workspace/** are mounted at /workspace.
export default defineSandbox({
  backend: superserveBackend({
    fromTemplate: "superserve/python-ml",
    timeoutSeconds: 1800,
  }),
});
