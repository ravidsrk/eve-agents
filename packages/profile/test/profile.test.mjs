import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";

import {
  DEFAULT_VERCEL_MODEL,
  DEFAULT_CONTEXT_WINDOW,
  isVercelRuntime,
  shouldUseSuperserve,
  resolveModel,
  resolveSuperserveBackend,
  resolveSandboxDefinition,
} from "../index.js";

const BASE_ENV = {
  VERCEL: "",
  SUPERSERVE_API_KEY: "",
  OPENROUTER_API_KEY: "",
  EVE_VERCEL_MODEL: "",
  OPENROUTER_MODEL: "",
};

function env(overrides = {}) {
  return { ...BASE_ENV, ...overrides };
}

describe("isVercelRuntime", () => {
  it("is false without VERCEL", () => {
    assert.equal(isVercelRuntime(env()), false);
  });

  it("is true when VERCEL is set", () => {
    assert.equal(isVercelRuntime(env({ VERCEL: "1" })), true);
  });
});

describe("shouldUseSuperserve", () => {
  it("is false on Vercel even with a key", () => {
    assert.equal(
      shouldUseSuperserve(env({ VERCEL: "1", SUPERSERVE_API_KEY: "ssk_test" })),
      false,
    );
  });

  it("is false locally without a key", () => {
    assert.equal(shouldUseSuperserve(env()), false);
  });

  it("is true locally with a trimmed key", () => {
    assert.equal(shouldUseSuperserve(env({ SUPERSERVE_API_KEY: "ssk_live" })), true);
  });

  it("is false for whitespace-only key", () => {
    assert.equal(shouldUseSuperserve(env({ SUPERSERVE_API_KEY: "   " })), false);
  });
});

describe("resolveModel", () => {
  it("returns default gateway model on Vercel", () => {
    const model = resolveModel({}, env({ VERCEL: "1" }));
    assert.equal(model, DEFAULT_VERCEL_MODEL);
  });

  it("honors EVE_VERCEL_MODEL on Vercel", () => {
    const model = resolveModel(
      {},
      env({ VERCEL: "1", EVE_VERCEL_MODEL: "anthropic/claude-sonnet-4.6" }),
    );
    assert.equal(model, "anthropic/claude-sonnet-4.6");
  });

  it("honors vercelModel option on Vercel", () => {
    const model = resolveModel({ vercelModel: "openai/gpt-5.4" }, env({ VERCEL: "1" }));
    assert.equal(model, "openai/gpt-5.4");
  });

  it("returns a LanguageModel locally (object with provider)", () => {
    const model = resolveModel({}, env({ OPENROUTER_API_KEY: "test-key" }));
    assert.equal(typeof model, "object");
    assert.ok(model);
    assert.equal(typeof model.provider, "string");
  });
});

describe("resolveSuperserveBackend", () => {
  it("returns undefined on Vercel", () => {
    assert.equal(
      resolveSuperserveBackend({ fromTemplate: "superserve/python-ml" }, env({ VERCEL: "1" })),
      undefined,
    );
  });

  it("returns undefined locally without key", () => {
    assert.equal(resolveSuperserveBackend({}, env()), undefined);
  });

  it("returns backend object locally with key", () => {
    const backend = resolveSuperserveBackend(
      { fromTemplate: "superserve/python-ml", timeoutSeconds: 60 },
      env({ SUPERSERVE_API_KEY: "ssk_test" }),
    );
    assert.equal(typeof backend, "object");
    assert.equal(backend.name, "superserve");
    assert.equal(typeof backend.create, "function");
    assert.equal(typeof backend.prewarm, "function");
  });
});

describe("resolveSandboxDefinition", () => {
  it("returns empty object when SuperServe is not used", () => {
    assert.deepEqual(resolveSandboxDefinition({}, env()), {});
  });

  it("returns { backend } when SuperServe is enabled", () => {
    const def = resolveSandboxDefinition(
      { superserve: { fromTemplate: "superserve/python-ml" } },
      env({ SUPERSERVE_API_KEY: "ssk_test" }),
    );
    assert.ok(def.backend);
    assert.equal(def.backend.name, "superserve");
  });
});

describe("constants", () => {
  it("exports sensible defaults", () => {
    assert.equal(DEFAULT_VERCEL_MODEL, "openai/gpt-5.4-mini");
    assert.ok(DEFAULT_CONTEXT_WINDOW >= 100_000);
  });
});