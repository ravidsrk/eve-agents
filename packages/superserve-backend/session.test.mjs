import assert from "node:assert/strict";
import test from "node:test";
import { buildSuperserveSession, shellQuoteArg } from "./session.js";

test("shellQuoteArg escapes spaces and shell metacharacters", () => {
  assert.equal(shellQuoteArg("a b; c"), "'a b; c'");
  assert.equal(shellQuoteArg("it's"), "'it'\\''s'");
});

test("toCommand quotes structured argv vectors", async () => {
  const commands = [];
  const sandbox = {
    commands: {
      async run(command) {
        commands.push(command);
        return { stdout: "", stderr: "", exitCode: 0 };
      },
      async spawn() {
        throw new Error("not used");
      },
    },
    files: {},
  };
  const session = buildSuperserveSession(sandbox, "test", async () => {});
  await session.run({ command: ["echo", "a b; c"] });
  assert.equal(commands.at(-1), "'echo' 'a b; c'");
});