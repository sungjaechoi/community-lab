import type { Metadata } from "next";
import { FeaturePreparation } from "@/components/feature-preparation";
export const metadata: Metadata = { title: "채팅" };
export default function ChatsPage() {
  return <FeaturePreparation eyebrow="KEEP THE CONVERSATION" title="채팅" description="가까운 대화가 시작되는 곳." stateTitle="편하게 대화할 공간을 준비하고 있어요" stateDescription="친구와 이어가는 1대1 대화를 준비하고 있어요. 대화가 시작되면 이곳에서 다시 만날 수 있어요." note="채팅 기능이 열리면 친구 목록에서 대화를 시작할 수 있어요." />;
}
