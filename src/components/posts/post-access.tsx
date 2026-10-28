"use client";

import Link from "next/link";
import { useAuth } from "../auth-provider";

export function WritePostLink() {
  const { session } = useAuth();
  return <Link className="button button--primary" href={session.status === "authenticated" ? "/posts/new" : "/login?next=%2Fposts%2Fnew"}><span aria-hidden="true">＋</span> 글쓰기</Link>;
}
