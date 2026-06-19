import { defineSandbox } from "eve/sandbox";
import { resolveSandboxDefinition } from "@eve-agents/profile";

export default defineSandbox(
  resolveSandboxDefinition({
    superserve: {
      fromTemplate: "superserve/node-22",
      timeoutSeconds: 1800,
    },
  }),
);