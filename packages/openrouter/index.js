// @lab/openrouter — OpenRouter as an eve model provider.
//
// eve's `defineAgent({ model })` accepts a provider-authored AI-SDK LanguageModel.
// eve pins ai@7.0.0-beta.178 (AI SDK v7 beta, provider spec v4). The OpenRouter-branded
// provider (@openrouter/ai-sdk-provider) targets older provider specs, so we use the
// version-matched @ai-sdk/openai-compatible pointed at OpenRouter's OpenAI-compatible API.
//
// See RESEARCH.md ("OpenRouter integration") for the compatibility analysis.

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

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
  vision: "qwen/qwen-2.5-vl-7b-instruct",
};

// Default to a reliable tool-caller. llama-3.1-8b is too weak for multi-step tool use
// (it asks clarifying questions / guesses), so the lab default is gpt-oss-120b.
export const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || MODELS.workhorse;

/**
 * Build a configured OpenRouter provider instance.
 * Reads OPENROUTER_API_KEY (falls back to OPEN_ROUTER_KEY) from the environment.
 */
export function createLabOpenRouter(opts = {}) {
  const apiKey =
    opts.apiKey || process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY (or OPEN_ROUTER_KEY) is not set. Add it to .env.local.",
    );
  }
  return createOpenAICompatible({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    headers: {
      "HTTP-Referer": "https://github.com/ravidsrk/eve-exploration",
      "X-Title": "eve-lab",
      ...(opts.headers || {}),
    },
  });
}

/**
 * Convenience: return a ready-to-use LanguageModel for `defineAgent({ model })`.
 * @param {string} [modelId] OpenRouter model id (defaults to DEFAULT_MODEL).
 */
export function orModel(modelId = DEFAULT_MODEL, opts = {}) {
  return createLabOpenRouter(opts)(modelId);
}

export default orModel;
