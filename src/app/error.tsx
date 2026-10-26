"use client";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/state-panel";
export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return <StatePanel kind="error" title="화면을 불러오지 못했어요" description="잠시 후 다시 시도해 주세요." action={<Button onClick={retry}>다시 시도</Button>} />;
}
