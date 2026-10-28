import { NextResponse, type NextRequest } from "next/server";
import { isTrustedAppOrigin, privateHeaders, requestOrigin, safeReturnPath } from "./policy";

// Browser navigation gets a safe recovery screen; API clients keep JSON/status.
export function authFailure(request: NextRequest, code: string, status: number, notice: string) {
  const origin = requestOrigin(request);
  if (origin && isTrustedAppOrigin(origin) && request.headers.get("accept")?.includes("text/html")) {
    const destination = new URL("/login", origin);
    destination.searchParams.set("status", notice);
    destination.searchParams.set("next", safeReturnPath(request.nextUrl.searchParams.get("next") ?? request.cookies.get("community-lab-return")?.value ?? null));
    // An explicit fragment prevents the browser inheriting provider error fragments.
    destination.hash = "_";
    const response = NextResponse.redirect(destination, { status: 303, headers: privateHeaders });
    response.cookies.set("community-lab-return", "", { path: "/auth/callback", maxAge: 0 });
    return response;
  }
  return NextResponse.json({ error: { code } }, { status, headers: privateHeaders });
}
