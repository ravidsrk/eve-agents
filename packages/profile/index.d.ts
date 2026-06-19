import type { LanguageModel } from "ai";

export declare const DEFAULT_VERCEL_MODEL: string;
export declare const DEFAULT_CONTEXT_WINDOW: number;

export declare function isVercelRuntime(env?: NodeJS.ProcessEnv): boolean;
export declare function shouldUseSuperserve(env?: NodeJS.ProcessEnv): boolean;

export declare function resolveModel(
  options?: { vercelModel?: string; labModel?: string },
  env?: NodeJS.ProcessEnv,
): string | LanguageModel;

export declare function resolveSuperserveBackend(
  superserveOpts?: Record<string, unknown>,
  env?: NodeJS.ProcessEnv,
): ReturnType<typeof import("@eve-agents/superserve-backend").superserveBackend> | undefined;

export declare function resolveSandboxDefinition(
  options?: { superserve?: Record<string, unknown> },
  env?: NodeJS.ProcessEnv,
): { backend?: unknown };