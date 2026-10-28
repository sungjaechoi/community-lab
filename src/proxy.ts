import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublicSettings } from "./lib/supabase/public-settings";
import { privateHeaders } from "./lib/auth/policy";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  Object.entries(privateHeaders).forEach(([name, value]) => response.headers.set(name, value));
  if (!request.cookies.getAll().some(({ name }) => name.startsWith("sb-"))) return response;
  try {
    const { url, key } = supabasePublicSettings();
    const auth = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values, headers) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          const previous = response.cookies.getAll();
          response = NextResponse.next({ request });
          previous.forEach((cookie) => response.cookies.set(cookie));
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries({ ...headers, ...privateHeaders }).forEach(([name, value]) => response.headers.set(name, value));
        },
      },
    });
    // This refreshes cookies. Protected handlers still verify the current user.
    await auth.auth.getClaims();
  } catch {
    // Never log cookie contents or original Auth errors. Handlers decide 401/503.
  }
  return response;
}

export const config = {
  matcher: ["/api/auth/:path*", "/auth/:path*", "/login", "/posts/:path*", "/friends/:path*", "/inbox/:path*", "/chats/:path*"],
};
