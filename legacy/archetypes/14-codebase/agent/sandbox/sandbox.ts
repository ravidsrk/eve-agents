import { defineSandbox } from "eve/sandbox";
import { superserveBackend } from "@lab/superserve-backend";

export default defineSandbox({
  backend: superserveBackend({
    fromTemplate: "superserve/python-ml",
    timeoutSeconds: 1800,
  }),
});
