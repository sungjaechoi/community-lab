import { NextResponse } from "next/server";
import { createServerAuthClient } from "@/lib/supabase/server";
import { isSameOriginRequest, isTrustedAppOrigin, privateHeaders, requestOrigin } from "@/lib/auth/policy";

export async function POST(request: Request) {
  const origin = requestOrigin(request);
  if (!origin || !isSameOriginRequest(request) || !isTrustedAppOrigin(origin)) return NextResponse.json({ error: { code: "CSRF_REJECTED" } }, { status: 403, headers: privateHeaders });
  try {
    const auth = await createServerAuthClient();
    const { error } = await auth.auth.signOut({ scope: "local" });
    if (error) return NextResponse.json({ error: { code: "SIGN_OUT_FAILED" } }, { status: 503, headers: privateHeaders });
    return new NextResponse(null, { status: 204, headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: { code: "SIGN_OUT_FAILED" } }, { status: 503, headers: privateHeaders });
  }
}
