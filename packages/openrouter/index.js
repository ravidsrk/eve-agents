// @lab/openrouter — OpenRouter as an eve model provider.
//
// eve's `defineAgent({ model })` accepts a provider-authored AI-SDK LanguageModel.
// eve pins ai@7.0.0-beta.178 (AI SDK v7 beta, provider spec v4). The OpenRouter-branded
// provider (@openrouter/ai-sdk-provider) targets older provider specs, so we use the
// version-matched @ai-sdk/openai-compatible pointed at OpenRouter's OpenAI-compatible API.
//
// See RESEARCH.md ("OpenRouter integration") for the compatibility analysis.

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { resolveOpenRouterKey } from "./load-env.js";

/**
 * Cheap, reliable defaults. OpenRouter ":free" models are heavily rate-limited
 * upstream (observed HTTP 429), so we default to ultra-cheap *paid* models and
 * escalate only when a task demonstrably needs more.
 */
export const MODELS = {
  // Reliable, cheap tool-caller with reasoning — the lab default/workhorse (~$0.039/1M in).
  workhorse: "openai/gpt-oss-120b",
  // ultra-cheap; fine for simple/no-tool agents, weak at multi-step tool use
  cheap: "meta-llama/llama-3.1-8b-instruct",
  small: "qwen/qwen-2.5-7b-instruct",
  // stronger reasoning when the workhorse struggles
  strong: "qwen/qwen3-next-80b-a3b-instruct",
  coder: "openai/gpt-oss-120b",
  // vision-capable
  vision: "google/gemini-2.5-flash",
};

// Default workhorse; resolved at call time so eve can load .env.local first.
export const DEFAULT_MODEL = MODELS.workhorse;

/** Fetch wrapper: resolve API key at request time (workflow workers lack process.env dotenv). */
function openRouterFetch(opts = {}) {
  const baseFetch = opts.fetch || globalThis.fetch.bind(globalThis);
  return async (url, init = {}) => {
    const apiKey = resolveOpenRouterKey(opts);
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY (or OPEN_ROUTER_KEY) is not set. Add it to .env.local.",
      );
    }
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${apiKey}`);
    headers.set("HTTP-Referer", "https://github.com/ravidsrk/eve-exploration");
    headers.set("X-Title", "lab");
    return baseFetch(url, { ...init, headers });
  };
}

/**
 * Build a configured OpenRouter provider instance.
 * Auth is applied per-request so agent modules can load before dotenv.
 */
export function createLabOpenRouter(opts = {}) {
  return createOpenAICompatible({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    fetch: openRouterFetch(opts),
    headers: {
      "HTTP-Referer": "https://github.com/ravidsrk/eve-exploration",
      "X-Title": "lab",
      ...(opts.headers || {}),
    },
  });
}

/**
 * Convenience: return a ready-to-use LanguageModel for `defineAgent({ model })`.
 * @param {string} [modelId] OpenRouter model id (defaults to OPENROUTER_MODEL or workhorse).
 */
export function orModel(modelId, opts = {}) {
  const id = modelId || process.env.OPENROUTER_MODEL || MODELS.workhorse;
  return createLabOpenRouter(opts)(id);
}

export default orModel;
