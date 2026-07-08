import type { LanguageModel } from "ai";
import type { SuperserveBackendOptions } from "@eve-agents/superserve-backend";

export declare const DEFAULT_VERCEL_MODEL: string;
export declare const DEFAULT_CONTEXT_WINDOW: number;

export declare function isVercelRuntime(env?: NodeJS.ProcessEnv): boolean;
export declare function shouldUseSuperserve(env?: NodeJS.ProcessEnv): boolean;

export declare function resolveModel(
  options?: { vercelModel?: string; labModel?: string },
  env?: NodeJS.ProcessEnv,
): string | LanguageModel;

export declare function resolveSuperserveBackend(
  superserveOpts?: SuperserveBackendOptions,
  env?: NodeJS.ProcessEnv,
): ReturnType<typeof import("@eve-agents/superserve-backend").superserveBackend> | undefined;

/**
 * Arguments for defineSandbox(). `backend` is typed as any to match
 * superserveBackend's loose SandboxBackend return (avoids coupling to eve internals).
 */
export declare function resolveSandboxDefinition(
  options?: { superserve?: SuperserveBackendOptions; killOnDispose?: boolean },
  env?: NodeJS.ProcessEnv,
): { backend?: any };
