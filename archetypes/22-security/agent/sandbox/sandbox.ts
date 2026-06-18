import { defineSandbox } from "eve/sandbox";
import { superserveBackend } from "@lab/superserve-backend";

// Lock egress down to deny-all. The backend maps this to SuperServe's denyOut: ["0.0.0.0/0"],
// so outbound network calls from inside the sandbox fail.
export default defineSandbox({
  backend: superserveBackend({
    fromTemplate: "superserve/base",
    timeoutSeconds: 1200,
    networkPolicy: "deny-all",
  }),
});
