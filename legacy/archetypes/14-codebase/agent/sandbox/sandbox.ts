import { defineSandbox } from "eve/sandbox";
import { superserveBackend } from "@lab/superserve-backend";

// base image ships git + curl + coreutils — enough to clone and inspect a repo.
export default defineSandbox({
  backend: superserveBackend({
    fromTemplate: "superserve/base",
    timeoutSeconds: 1800,
  }),
});
