import type { Metadata } from "next";
import { FeaturePreparation } from "@/components/feature-preparation";
export const metadata: Metadata = { title: "쪽지" };
export default function InboxPage() {
  return <FeaturePreparation eyebrow="JUST BETWEEN US" title="쪽지" description="친구에게만 전하고 싶은 이야기." stateTitle="마음을 전할 공간을 준비하고 있어요" stateDescription="친구와 주고받은 쪽지를 나의 쪽지함에서 읽고 간직할 수 있도록 준비하고 있어요." note="쪽지는 친구에게만 보낼 수 있어요. 기능이 열리면 수신함과 발신함을 함께 확인할 수 있어요." />;
}
