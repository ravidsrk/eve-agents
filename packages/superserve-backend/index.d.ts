import type { SandboxNetworkPolicy } from "eve/sandbox";

export interface SuperserveBackendOptions {
  fromTemplate?: string | { name?: string; id: string };
  timeoutSeconds?: number;
  envVars?: Record<string, string>;
  networkPolicy?: SandboxNetworkPolicy;
  killOnDispose?: boolean;
}

// Returns an eve SandboxBackend (typed loosely to avoid coupling to eve's internal
// minified type names; structurally compatible with `defineSandbox({ backend })`).
export declare function superserveBackend(opts?: SuperserveBackendOptions): any;
export default superserveBackend;
