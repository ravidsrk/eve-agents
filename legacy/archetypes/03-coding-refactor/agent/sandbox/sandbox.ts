import { defineSandbox } from "eve/sandbox";
import { superserveBackend } from "@lab/superserve-backend";

export default defineSandbox({
  backend: superserveBackend({
    fromTemplate: "superserve/node-22",
    timeoutSeconds: 1800,
  }),
});
