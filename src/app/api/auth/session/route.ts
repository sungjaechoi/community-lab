import { NextResponse } from "next/server";
import { verifiedUser } from "@/lib/auth/server";
import { authDisplayName, privateHeaders } from "@/lib/auth/policy";

export async function GET() {
  try {
    const { user, unavailable } = await verifiedUser();
    if (!user) return NextResponse.json({ error: { code: unavailable ? "AUTH_UNAVAILABLE" : "UNAUTHENTICATED" } }, { status: unavailable ? 503 : 401, headers: privateHeaders });
    return NextResponse.json({ user: { id: user.id, displayName: authDisplayName(user.user_metadata) } }, { headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: { code: "AUTH_UNAVAILABLE" } }, { status: 503, headers: privateHeaders });
  }
}
