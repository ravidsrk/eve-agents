import { defineTool } from "eve/tools";
import { z } from "zod";

// The model sees this tool as `get_weather` (from the filename).
// Authored tools run in the app runtime (full process.env), not the sandbox.
export default defineTool({
  description: "Get the current weather for a city.",
  inputSchema: z.object({
    city: z.string().min(1).describe("City name, e.g. 'Brooklyn'"),
  }),
  async execute({ city }) {
    // Deterministic stub so the canonical happy-path is reproducible offline.
    return { city, condition: "Sunny", temperatureF: 72, humidity: 0.41 };
  },
});
