// Shared route auth for catalog and production agents: local dev, Vercel OIDC, optional HTTP basic.
import { httpBasic, localDev, vercelOidc } from "eve/channels/auth";

/**
 * Auth walk for eveChannel. Set ROUTE_AUTH_BASIC_USER + ROUTE_AUTH_BASIC_PASSWORD
 * on Vercel for operator/curl access; omit locally (localDev opens loopback).
 */
export function routeAuth() {
  const auth = [localDev(), vercelOidc()];
  const username = process.env.ROUTE_AUTH_BASIC_USER?.trim();
  const password = process.env.ROUTE_AUTH_BASIC_PASSWORD?.trim();
  if (username && password) {
    auth.push(httpBasic({ username, password }));
  }
  return auth;
}

/** @deprecated Use routeAuth() */
export function catalogRouteAuth() {
  return routeAuth();
}