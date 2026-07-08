import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shellQuoteArg, toCommand } from "../session.js";

describe("shellQuoteArg / toCommand (COUP-003)", () => {
  it("single-quotes args so spaces and metacharacters stay literal", () => {
    assert.equal(shellQuoteArg("a b; c"), "'a b; c'");
    assert.equal(shellQuoteArg("it's"), "'it'\\''s'");
  });

  it("joins array command argv with quoting", () => {
    assert.equal(toCommand({ command: ["echo", "a b; c"] }), "'echo' 'a b; c'");
  });

  it("quotes command string plus args", () => {
    assert.equal(toCommand({ command: "echo", args: ["a b; c"] }), "'echo' 'a b; c'");
  });
});
