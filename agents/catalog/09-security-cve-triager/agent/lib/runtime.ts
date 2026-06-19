// Dual-track runtime: AI Gateway on Vercel, OpenRouter + SuperServe locally.
export {
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_VERCEL_MODEL,
  isVercelRuntime,
  resolveModel,
  resolveSandboxDefinition,
  resolveSuperserveBackend,
  shouldUseSuperserve,
} from "@eve-catalog/profile";
