import { defineSandbox } from "eve/sandbox";
import { resolveSandboxDefinition } from "@eve-catalog/profile";

export default defineSandbox(
  resolveSandboxDefinition({
    superserve: {
      fromTemplate: "superserve/python-ml",
      timeoutSeconds: 1800,
    },
  }),
);
