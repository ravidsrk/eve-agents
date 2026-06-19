import { defineSandbox } from "eve/sandbox";
import { superserveBackend } from "@eve-catalog/superserve-backend";

export default defineSandbox({
  backend: superserveBackend({
    fromTemplate: "superserve/python-ml",
    timeoutSeconds: 1800,
  }),
});
