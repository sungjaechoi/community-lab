import { NextResponse, type NextRequest } from "next/server";
import { createServerAuthClient } from "@/lib/supabase/server";
import { isTrustedAppOrigin, privateHeaders, requestOrigin, safeReturnPath, validReturnPath } from "@/lib/auth/policy";
import { authFailure } from "@/lib/auth/browser-response";

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request);
  if (!origin || !isTrustedAppOrigin(origin)) return NextResponse.json({ error: { code: "INVALID_ORIGIN" } }, { status: 400, headers: privateHeaders });
  const query = request.nextUrl.searchParams;
  if (!validReturnPath(query.get("next"))) return authFailure(request, "INVALID_RETURN_PATH", 400, "invalid-return");
  if (query.has("error")) return authFailure(request, "OAUTH_CANCELLED", 400, query.get("error") === "access_denied" ? "cancelled" : "provider");
  const code = query.get("code");
  if (!code || code.length > 2048) return authFailure(request, "INVALID_CALLBACK", 400, "callback");
  try {
    const auth = await createServerAuthClient();
    const exchanged = await auth.auth.exchangeCodeForSession(code);
    if (exchanged.error) return authFailure(request, "INVALID_CALLBACK", 400, "callback");
    const { data, error } = await auth.auth.getUser();
    if (error || !data.user) return authFailure(request, "UNAUTHENTICATED", 401, "callback");
    const destination = safeReturnPath(query.get("next") ?? request.cookies.get("community-lab-return")?.value ?? null);
    const response = NextResponse.redirect(new URL(destination, origin), { status: 303, headers: privateHeaders });
    response.cookies.set("community-lab-return", "", { path: "/auth/callback", maxAge: 0 });
    return response;
  } catch {
    return authFailure(request, "AUTH_UNAVAILABLE", 503, "callback");
  }
}
