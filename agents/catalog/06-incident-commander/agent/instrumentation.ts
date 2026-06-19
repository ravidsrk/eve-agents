/**
 * OpenTelemetry hooks for flagship deploy (Phase 6).
 * Enable with OTEL_EXPORTER_OTLP_ENDPOINT on Vercel.
 */
export async function register() {
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()) return;
  // Eve runtime picks up standard OTEL_* env vars when instrumentation is present.
}