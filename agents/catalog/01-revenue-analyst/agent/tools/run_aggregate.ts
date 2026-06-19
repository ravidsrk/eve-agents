import { readFileSync } from "node:fs";
import path from "node:path";
import { defineTool } from "eve/tools";
import { z } from "zod";

type Row = { region: string; product: string; revenue: number; recognized: boolean };

function loadRevenue(): Row[] {
  const file = path.join(process.cwd(), "agent/data/revenue.csv");
  const lines = readFileSync(file, "utf8").trim().split("\n");
  const [, ...rows] = lines;
  return rows.map((line) => {
    const [region, product, revenue, recognized] = line.split(",");
    return {
      region,
      product,
      revenue: Number(revenue),
      recognized: recognized === "true",
    };
  });
}

export default defineTool({
  description:
    "Aggregate recognized revenue from the warehouse extract (agent/data/revenue.csv) by region or product.",
  inputSchema: z.object({
    metric: z.enum(["sum", "avg", "count"]).default("sum"),
    groupBy: z.enum(["region", "product"]).optional(),
    recognizedOnly: z.boolean().default(true),
  }),
  async execute({ metric, groupBy, recognizedOnly }) {
    let rows = loadRevenue();
    if (recognizedOnly) rows = rows.filter((r) => r.recognized);

    if (!groupBy) {
      const values = rows.map((r) => r.revenue);
      const total =
        metric === "count"
          ? rows.length
          : metric === "avg"
            ? values.reduce((a, b) => a + b, 0) / (values.length || 1)
            : values.reduce((a, b) => a + b, 0);
      return {
        metric,
        groupBy: null,
        total: Math.round(total * 100) / 100,
        assumptions: [
          "Uses agent/data/revenue.csv warehouse extract.",
          recognizedOnly ? "Filters to recognized=true rows only." : "Includes all rows.",
        ],
      };
    }

    const buckets = new Map<string, number[]>();
    for (const row of rows) {
      const key = row[groupBy];
      const list = buckets.get(key) ?? [];
      list.push(row.revenue);
      buckets.set(key, list);
    }

    const groups = [...buckets.entries()].map(([key, values]) => {
      const value =
        metric === "count"
          ? values.length
          : metric === "avg"
            ? values.reduce((a, b) => a + b, 0) / values.length
            : values.reduce((a, b) => a + b, 0);
      return { key, value: Math.round(value * 100) / 100 };
    });

    return {
      metric,
      groupBy,
      groups,
      assumptions: [
        "Uses agent/data/revenue.csv warehouse extract.",
        recognizedOnly ? "Filters to recognized=true rows only." : "Includes all rows.",
      ],
    };
  },
});