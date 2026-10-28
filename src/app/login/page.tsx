import type { Metadata } from "next";
import { LoginPanel } from "@/components/login-panel";
import { safeReturnPath, validReturnPath } from "@/lib/auth/policy";
export const metadata: Metadata = { title: "로그인", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const query = await searchParams;
  const next = typeof query.next === "string" ? query.next : null;
  const notice = !validReturnPath(next) || Array.isArray(query.next) ? "invalid-return" :
    typeof query.status === "string" ? query.status : "";
  return <LoginPanel key={`${safeReturnPath(next)}:${notice}`} next={safeReturnPath(next)} notice={notice} />;
}
