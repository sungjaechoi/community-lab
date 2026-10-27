import { checkRuntimeDatabase } from "@/lib/server/check-database";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const hostname = new URL(request.url).hostname;
  if (process.env.NODE_ENV !== "development" || !["localhost", "127.0.0.1", "[::1]"].includes(hostname)) {
    return new Response(null, { status: 404 });
  }
  const result = await checkRuntimeDatabase();
  return Response.json(result, {
    status: result.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
