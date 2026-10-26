import { StatePanel } from "@/components/ui/state-panel";
export default function Loading() {
  return <StatePanel kind="loading" title="잠시만 기다려 주세요" description="화면을 불러오고 있어요." />;
}
