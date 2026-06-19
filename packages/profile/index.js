// @eve-agents/profile — dual-track model and sandbox resolution for catalog agents.
//
// Track A (lab): OpenRouter + SuperServe when keys are present.
// Track B (Vercel): AI Gateway model strings + defaultBackend() / vercel() sandbox.

import { orModel } from "@eve-agents/openrouter";
import { superserveBackend } from "@eve-agents/superserve-backend";

/** True when running on a Vercel deployment (build or runtime). */
export function isVercelRuntime(env = process.env) {
  return Boolean(env.VERCEL);
}

/** True when SuperServe sandbox should be wired (local lab with key). */
export function shouldUseSuperserve(env = process.env) {
  if (isVercelRuntime(env)) return false;
  return Boolean(env.SUPERSERVE_API_KEY?.trim());
}

/**
 * Default AI Gateway model for hosted deploys.
 * Override with EVE_VERCEL_MODEL or resolveModel({ vercelModel }).
 */
export const DEFAULT_VERCEL_MODEL = "openai/gpt-5.4-mini";

/**
 * Model for defineAgent({ model }).
 * - On Vercel: provider/model string → AI Gateway + OIDC.
 * - Locally: OpenRouter LanguageModel via @eve-agents/openrouter.
 *
 * @param {object} [options]
 * @param {string} [options.vercelModel]
 * @param {string} [options.labModel] OpenRouter model id
 */
export function resolveModel(options = {}, env = process.env) {
  if (isVercelRuntime(env)) {
    const fromEnv = env.EVE_VERCEL_MODEL?.trim();
    return options.vercelModel ?? (fromEnv || DEFAULT_VERCEL_MODEL);
  }
  const labId = options.labModel ?? env.OPENROUTER_MODEL;
  return orModel(labId);
}

/**
 * SuperServe backend factory when lab keys are set; otherwise undefined so eve
 * uses defaultBackend() (local docker/just-bash or Vercel Sandbox on deploy).
 *
 * @param {object} superserveOpts Passed to superserveBackend()
 */
export function resolveSuperserveBackend(superserveOpts = {}, env = process.env) {
  if (!shouldUseSuperserve(env)) return undefined;
  return superserveBackend(superserveOpts);
}

/**
 * Arguments for defineSandbox() — either { backend } for lab or {} for defaults.
 *
 * @param {object} [options]
 * @param {object} [options.superserve] superserveBackend options
 */
export function resolveSandboxDefinition(options = {}, env = process.env) {
  const superserve = { ...(options.superserve ?? {}) };
  if (options.killOnDispose === true || env.EVE_KILL_SANDBOX_ON_DISPOSE === "1") {
    superserve.killOnDispose = true;
  }
  const backend = resolveSuperserveBackend(superserve, env);
  return backend ? { backend } : {};
}

/** Shared context window for catalog agents. */
export const DEFAULT_CONTEXT_WINDOW = 131_072;