import { defineEval } from "eve/evals";

export default defineEval({
  description: "A plain greeting should not trigger any tool call.",
  async test(t) {
    await t.send("Hi there!");
    t.completed();
    t.usedNoTools();
  },
});
