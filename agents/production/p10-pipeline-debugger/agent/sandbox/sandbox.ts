import { defineSandbox } from "eve/sandbox";
import { superserveBackend } from "@eve-catalog/superserve-backend";

/**
 * Default production sandbox — SuperServe microVMs (real bash, fast boot).
 * Replaces eve's local microsandbox backend, which requires KVM and hangs on macOS.
 */
export default defineSandbox({
  backend: superserveBackend({
    fromTemplate: "superserve/node-22",
    timeoutSeconds: 1800,
  }),
});