import type { AuthFn } from "eve/channels/auth";

export function routeAuth(): AuthFn<Request>[];

/** @deprecated Use routeAuth() */
export function catalogRouteAuth(): AuthFn<Request>[];