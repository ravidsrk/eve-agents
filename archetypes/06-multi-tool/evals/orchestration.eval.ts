import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description: "Multi-tool: a 3-part request triggers all three tools and a combined answer.",
  async test(t) {
    await t.send(
      "Three things: (1) weather in Paris, (2) convert 250 USD to EUR, (3) a 15% tip on an 80 dollar bill. Use your tools.",
    );
    t.completed();
    t.calledTool("get_weather");
    t.calledTool("convert_currency");
    t.calledTool("calculate");
    // 250 USD -> EUR at 0.92 = 230; 15% of 80 = 12.
    t.check((t.reply ?? "").replace(/,/g, ""), includes("230"));
    t.check(t.reply ?? "", includes("12"));
  },
});
