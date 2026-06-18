import { defineSandbox } from "eve/sandbox";
import { superserveBackend } from "@lab/superserve-backend";

// Base image is enough (we only write/read a file). On dispose the VM is paused, not killed,
// so the next turn reconnects to the same VM with /workspace intact — even across a full
// process restart, because eve persists the reconnect metadata in durable session state.
export default defineSandbox({
  backend: superserveBackend({
    fromTemplate: "superserve/base",
    timeoutSeconds: 3600,
  }),
});
