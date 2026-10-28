// Presentation only: this is the Google account name, not a service profile.
export function authDisplayName(metadata: Record<string, unknown>) {
  const name = typeof metadata.full_name === "string" ? metadata.full_name :
    typeof metadata.name === "string" ? metadata.name : "";
  return Array.from(name.trim()).slice(0, 40).join("") || "사용자";
}

const publicRoutes = new Set(["/posts", "/friends", "/inbox", "/chats"]);
function allowedReturnPath(value: string) {
  return publicRoutes.has(value) || value === "/posts/new" ||
    /^\/posts\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:\/edit)?$/i.test(value);
}
export function safeReturnPath(value: string | null) {
  // An explicit internal allowlist also rejects encoded //, backslashes and auth loops.
  return value && allowedReturnPath(value) ? value : "/posts";
}

export function validReturnPath(value: string | null) {
  return value === null || allowedReturnPath(value);
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return origin === requestOrigin(request) && (!fetchSite || fetchSite === "same-origin");
}

// Next may normalize request.url's loopback hostname. Keep the browser's Host,
// then compare the result with our explicit app-origin allowlist before redirects.
export function requestOrigin(request: Request) {
  try {
    const url = new URL(request.url);
    const host = request.headers.get("host");
    if (!host) return url.origin;
    const actual = new URL(`${url.protocol}//${host}`);
    return actual.host === host && !actual.username && !actual.password ? actual.origin : null;
  } catch { return null; }
}

export function isTrustedAppOrigin(origin: string, configured = process.env.NEXT_PUBLIC_SITE_URL) {
  if (!configured) return false;
  try {
    const site = new URL(configured);
    const incoming = new URL(origin);
    if (incoming.origin === site.origin) return true;
    const local = ["localhost", "127.0.0.1"];
    return site.protocol === "http:" && incoming.protocol === "http:" &&
      local.includes(site.hostname) && local.includes(incoming.hostname) && site.port === incoming.port;
  } catch { return false; }
}

export const privateHeaders = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
  "Pragma": "no-cache", "Expires": "0", "Vary": "Cookie", "Referrer-Policy": "no-referrer",
};
