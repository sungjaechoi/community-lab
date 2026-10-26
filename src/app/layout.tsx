import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Community Lab",
  description: "이야기를 나누고 관계를 이어 가는 커뮤니티",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
