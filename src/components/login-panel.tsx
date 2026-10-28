"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "./auth-provider";

const notices: Record<string, { title: string; text: string; error?: boolean }> = {
  cancelled: { title: "로그인을 취소했어요", text: "원할 때 다시 시작할 수 있어요. 아래 버튼을 눌러 주세요." },
  provider: { title: "Google 로그인을 완료하지 못했어요", text: "잠시 뒤 다시 시도해 주세요. 계속되면 Google 계정의 로그인 가능 여부를 확인해 주세요.", error: true },
  callback: { title: "로그인 연결이 만료되었어요", text: "이전 링크를 다시 사용하지 말고 아래 버튼으로 새로 시작해 주세요.", error: true },
  "invalid-return": { title: "돌아갈 주소를 확인했어요", text: "허용되지 않은 주소여서 로그인 후 게시글 화면으로 이동해요." },
  "signed-out": { title: "로그아웃했어요", text: "다시 이야기 나누고 싶을 때 로그인해 주세요." },
};
const destinations: Record<string, string> = { "/posts": "게시글", "/friends": "친구", "/inbox": "쪽지", "/chats": "채팅" };

export function LoginPanel({ next, notice }: { next: string; notice: string }) {
  const destination = destinations[next] ?? (next === "/posts/new" ? "글쓰기" : next.endsWith("/edit") ? "글 수정" : "게시글 상세");
  const { session, refresh } = useAuth();
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(false);
  const started = useRef(false);
  const checkingRef = useRef(false);
  const recovered = session.status === "authenticated" && ["signed-out", "callback", "provider"].includes(notice);
  const message = !recovered && Object.hasOwn(notices, notice) ? notices[notice] : undefined;
  useEffect(() => {
    const reset = () => { started.current = false; setPending(false); };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  return <div className="auth-page"><section className="auth-card" aria-labelledby="login-title">
    <span className="auth-symbol" aria-hidden="true">C<span>·</span></span>
    <p className="eyebrow">WELCOME TO COMMUNITY LAB</p><h1 id="login-title">당신의 이야기를<br />들려주세요.</h1>
    <p className="auth-description">글을 나누고 친구와 대화하는 시간.<br />Google 계정으로 함께해요.</p>
    {message && <div className={`auth-message${message.error ? " auth-message--error" : ""}`} role={message.error ? "alert" : "status"}><strong>{message.title}</strong><p>{message.text}</p></div>}
    {session.status === "authenticated" ? <>
      <p className="auth-welcome"><strong>{session.user.displayName}</strong>님, 로그인되어 있어요.</p>
      <Link className="button button--primary google-button" href={next}>{destination} 화면으로 계속하기 <span aria-hidden="true">→</span></Link>
    </> : session.status === "error" ? <>
      <p className="auth-status" role="alert">로그인 상태를 확인하지 못했어요.<br />연결을 확인한 뒤 다시 시도해 주세요.</p>
      <Button variant="secondary" className="google-button" pending={checking} onClick={async () => {
        if (checkingRef.current) return;
        checkingRef.current = true; setChecking(true);
        try { await refresh(); } finally { checkingRef.current = false; setChecking(false); }
      }}>{checking ? "다시 확인 중…" : "로그인 상태 다시 확인"}</Button>
    </> : <form action="/auth/sign-in" method="get" onSubmit={(event) => {
        if (started.current) { event.preventDefault(); return; }
        started.current = true; setPending(true);
      }}>
      <input type="hidden" name="next" value={next} />
      <Button type="submit" className="google-button" variant="secondary" pending={pending || session.status === "loading"} aria-describedby="login-status"><span aria-hidden="true" className="google-letter">G</span>{session.status === "loading" ? "로그인 상태 확인 중…" : pending ? "Google로 이동 중…" : "Google로 로그인"}</Button>
      <p className="auth-status" id="login-status" role="status">{pending ? "Google에서 로그인을 완료해 주세요. 돌아와서 다시 시도할 수도 있어요." : `로그인 후 ${destination} 화면으로 돌아와요.`}</p>
    </form>}
    <div className="auth-divider" /><Link className="text-link" href="/posts">게시글 화면으로 돌아가기 <span aria-hidden="true">↗</span></Link>
  </section><p className="auth-caption">서로의 이야기가 쌓이는 곳, Community Lab</p></div>;
}
