// Generated from scripts/generate-catalog.mjs.
// Keep static agent metadata here so tools/channels can share it without
// duplicating strings across the project.

export const profile = {
  id: "37-etl-data-quality-monitor",
  title: "ETL data quality monitor",
  owner: "Data",
  job: "Detects schema drift, null spikes, and late data.",
  rule: "Classify each incident by freshness, completeness, validity, or schema.",
  tags: ["data","etl"],
} as const;
