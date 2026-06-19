import { timingSafeEqual } from "node:crypto";
import { defineChannel, POST } from "eve/channels";

function unauthorized() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

function extractWebhookSecret(req: Request): string | null {
  const header = req.headers.get("x-alert-webhook-secret")?.trim();
  if (header) return header;

  const auth = req.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim() || null;
  }
  return null;
}

function secretsMatch(expected: string, provided: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function verifyAlertWebhook(req: Request): Response | null {
  const secret = process.env.ALERT_WEBHOOK_SECRET?.trim();
  if (!secret) return unauthorized();

  const provided = extractWebhookSecret(req);
  if (!provided || !secretsMatch(secret, provided)) return unauthorized();

  return null;
}

/**
 * Ingestion webhook for incident alerts. Starts an investigation session;
 * pair with Slack via docs/CONNECT.md for thread handoff on deploy.
 */
export default defineChannel({
  routes: [
    POST("/incident", async (req, { send }) => {
      const authFailure = verifyAlertWebhook(req);
      if (authFailure) return authFailure;

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