import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export const metadata: Metadata = { title: "로그인" };
export default function LoginPage() {
  return (
    <div className="auth-page"><section className="auth-card" aria-labelledby="login-title"><span className="auth-symbol" aria-hidden="true">C<span>·</span></span><p className="eyebrow">WELCOME TO COMMUNITY LAB</p><h1 id="login-title">당신의 이야기를<br />들려주세요.</h1><p className="auth-description">글을 나누고 친구와 대화하는 시간.<br />하나의 계정으로 함께할 수 있어요.</p><Button disabled aria-describedby="login-status" className="google-button" variant="secondary"><span aria-hidden="true" className="google-letter">G</span>Google로 로그인</Button><p className="auth-status" id="login-status"><span className="status-dot" />로그인 기능을 준비하고 있어요.</p><div className="auth-divider" /><Link className="text-link" href="/posts">게시글 화면으로 돌아가기 <span aria-hidden="true">↗</span></Link></section><p className="auth-caption">서로의 이야기가 쌓이는 곳, Community Lab</p></div>
  );
}
