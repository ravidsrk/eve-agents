import { defineChannel, POST } from "eve/channels";

/**
 * Ingestion webhook for incident alerts. Starts an investigation session;
 * pair with Slack via docs/CONNECT.md for thread handoff on deploy.
 */
export default defineChannel({
  routes: [
    POST("/incident", async (req, { send }) => {
      const body = (await req.json().catch(() => ({}))) as {
        title?: string;
        reference?: string;
        severity?: string;
      };
      const ref = body.reference ?? crypto.randomUUID();
      const message = [
        "Incident alert received.",
        `Reference: ${ref}`,
        `Title: ${body.title ?? "untitled"}`,
        `Severity: ${body.severity ?? "unknown"}`,
        "Load dossier, search urgent records, and reply ALERT-ACK on its own line.",
      ].join("\n");

      const session = await send(message, {
        auth: {
          authenticator: "alert-webhook",
          principalType: "service",
          principalId: "incident-ingest",
          attributes: body,
        },
        continuationToken: `alert:${ref}`,
      });

      return Response.json({ ok: true, sessionId: session.id, reference: ref });
    }),
  ],
});