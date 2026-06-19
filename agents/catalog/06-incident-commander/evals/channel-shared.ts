import type { EveEvalTargetHandle } from "eve/evals";

export async function postChannel<T>(
  target: EveEvalTargetHandle,
  path: string,
  body: unknown,
  options?: { headers?: Record<string, string> },
): Promise<T> {
  const response = await postChannelRaw(target, path, body, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`POST ${path} failed (${response.status}): ${text}`);
  }
  return JSON.parse(text) as T;
}

export async function postChannelRaw(
  target: EveEvalTargetHandle,
  path: string,
  body: unknown,
  options?: { headers?: Record<string, string> },
): Promise<Response> {
  return target.fetch(path, {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", ...options?.headers },
    method: "POST",
  });
}

export function alertWebhookHeaders(secret: string): Record<string, string> {
  return { "x-alert-webhook-secret": secret };
}