"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import { safeReturnPath } from "@/lib/auth/policy";

const navigation = [
  { href: "/posts", label: "게시글", path: "M4 4h16v12H9l-5 4V4Zm4 4h8M8 12h5" },
  { href: "/friends", label: "친구", path: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m8-7.87a4 4 0 0 1 0 7.75" },
  { href: "/inbox", label: "쪽지", path: "M3 5h18v14H3V5Zm0 1 9 7 9-7" },
  { href: "/chats", label: "채팅", path: "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z" },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, expired, signingOut, signOutError, refresh, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  function renderLinks() {
    return navigation.map(({ href, label, path }) => {
      const active = pathname === href || pathname.startsWith(`${href}/`);
      return (
        <Link key={href} href={href} className="nav-link" aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>
          {label}
        </Link>
      );
    });
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/posts" className="brand" aria-label="Community Lab 게시글 홈" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true"><span /><span /></span>
          <span>community<span className="brand-light">lab</span><span className="brand-dot">.</span></span>
        </Link>
        <nav className="desktop-nav" aria-label="주 메뉴">{renderLinks()}</nav>
        <div className="header-actions">
          {session.status === "loading" && <span className="session-loading" role="status">로그인 확인 중…</span>}
          {session.status === "guest" && <Link href={`/login?next=${encodeURIComponent(safeReturnPath(pathname))}`} className="button button--secondary login-link" aria-current={pathname === "/login" ? "page" : undefined} onClick={() => setOpen(false)}>로그인</Link>}
          {session.status === "error" && <Button variant="ghost" className="session-retry" onClick={() => void refresh()}>로그인 상태 재확인</Button>}
          {session.status === "authenticated" && <div className="user-menu"><span className="user-nickname" title={session.user.displayName}>{session.user.displayName}<span className="user-suffix">님</span></span><Button variant="secondary" className="login-link" pending={signingOut} onClick={async () => {
            if (await signOut()) { setOpen(false); router.replace("/login?status=signed-out"); router.refresh(); }
          }}>{signingOut ? "로그아웃 중…" : "로그아웃"}</Button></div>}
          <button ref={menuButton} type="button" className="menu-toggle" aria-label={open ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d={open ? "m6 6 12 12M6 18 18 6" : "M4 7h16M4 12h16M4 17h16"} /></svg>
          </button>
        </div>
        <nav id="mobile-navigation" className="mobile-nav" aria-label="모바일 주 메뉴" hidden={!open}>{session.status === "authenticated" && <p className="mobile-user">{session.user.displayName}님</p>}{renderLinks()}</nav>
      </div>
      {(signOutError || expired || session.status === "error") && <div className="session-notice" role={signOutError || session.status === "error" ? "alert" : "status"}>
        {signOutError || (session.status === "error" ? "로그인 상태를 확인하지 못했어요. 다시 확인해 주세요." : "로그인이 만료되었거나 다른 창에서 로그아웃했어요.")}
      </div>}
    </header>
  );
}
