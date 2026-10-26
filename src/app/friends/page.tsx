import type { Metadata } from "next";
import { FeaturePreparation } from "@/components/feature-preparation";
export const metadata: Metadata = { title: "친구" };
export default function FriendsPage() {
  return <FeaturePreparation eyebrow="YOUR CONNECTIONS" title="친구" description="이야기로 만나고, 친구로 이어져요." stateTitle="새로운 연결을 준비하고 있어요" stateDescription="친구 목록과 받은 요청, 보낸 요청을 한곳에서 확인할 수 있도록 준비하고 있어요." note="친구 기능이 열리면 게시글 작성자에게 친구 요청을 보낼 수 있어요." />;
}
