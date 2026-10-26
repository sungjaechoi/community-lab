import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewClient } from "./preview-client";

export const metadata: Metadata = {
  title: "공통 화면 검토",
  robots: { index: false, follow: false },
};

export default function UiPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <PreviewClient />;
}
