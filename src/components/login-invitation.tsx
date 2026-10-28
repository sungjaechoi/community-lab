"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import { safeReturnPath } from "@/lib/auth/policy";

export function LoginInvitation() {
  const { session } = useAuth();
  const pathname = usePathname();
  if (session.status !== "guest") return null;
  return <Link href={`/login?next=${encodeURIComponent(safeReturnPath(pathname))}`} className="button button--secondary">로그인하고 함께하기</Link>;
}
