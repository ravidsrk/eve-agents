import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description: "Weather agent calls get_weather and reports the condition.",
  async test(t) {
    await t.send("What is the weather in Brooklyn?");
    t.completed();
    t.calledTool("get_weather");
    // Case-insensitive: the model may render the condition as "Sunny" or "sunny".
    t.check((t.reply ?? "").toLowerCase(), includes("sunny"));
  },
});
