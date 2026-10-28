import { NextResponse, type NextRequest } from "next/server";
import { createServerAuthClient } from "@/lib/supabase/server";
import { isTrustedAppOrigin, privateHeaders, requestOrigin, safeReturnPath, validReturnPath } from "@/lib/auth/policy";
import { authFailure } from "@/lib/auth/browser-response";

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request);
  if (!origin || !isTrustedAppOrigin(origin)) return NextResponse.json({ error: { code: "INVALID_ORIGIN" } }, { status: 400, headers: privateHeaders });
  const next = request.nextUrl.searchParams.get("next");
  if (!validReturnPath(next)) return authFailure(request, "INVALID_RETURN_PATH", 400, "invalid-return");
  try {
    const callback = new URL("/auth/callback", origin);
    const auth = await createServerAuthClient();
    const { data, error } = await auth.auth.signInWithOAuth({
      provider: "google", options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
    });
    if (error || !data.url) throw new Error("OAUTH_START_FAILED");
    const response = NextResponse.redirect(data.url, { status: 303, headers: privateHeaders });
    response.cookies.set("community-lab-return", safeReturnPath(next), {
      httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/auth/callback", maxAge: 600,
    });
    return response;
  } catch {
    return authFailure(request, "OAUTH_UNAVAILABLE", 503, "provider");
  }
}
