import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Community Lab", template: "%s · Community Lab" },
  description: "이야기를 나누고 관계를 이어 가는 커뮤니티",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        <a href="#main-content" className="skip-link">본문으로 바로가기</a>
        <AppHeader />
        <main id="main-content" className="main-shell" tabIndex={-1}>{children}</main>
        <footer className="site-footer"><div className="footer-inner"><span className="footer-brand">communitylab.</span><p>이야기로 이어지는 작은 커뮤니티</p><span className="footer-end">함께 나누고, 천천히 자라는 공간</span></div></footer>
      </body>
    </html>
  );
}
