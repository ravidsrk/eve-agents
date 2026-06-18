// Verification gate: prove @ai-sdk/openai-compatible builds a LanguageModel that
// eve's bundled `ai` (v7 beta) accepts, calling OpenRouter live with a cheap model.
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("OPENROUTER_API_KEY missing");
  process.exit(2);
}

const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey,
  headers: {
    "HTTP-Referer": "https://github.com/ravidsrk/eve-exploration",
    "X-Title": "eve-lab",
  },
});

const modelId = process.argv[2] || "meta-llama/llama-3.1-8b-instruct";
const model = openrouter(modelId);
console.log("model.specificationVersion =", model.specificationVersion);
console.log("model.provider =", model.provider, "| modelId =", model.modelId);

const res = await generateText({
  model,
  prompt: "Reply with exactly one word: pong",
  maxOutputTokens: 16,
});
console.log("=== TEXT ===\n" + res.text.trim());
console.log("=== USAGE ===", JSON.stringify(res.usage));
console.log("=== finishReason ===", res.finishReason);
