import Link from "next/link";
import { StatePanel } from "@/components/ui/state-panel";
export default function NotFound() {
  return <StatePanel kind="empty" title="찾으시는 페이지가 없어요" description="주소가 바뀌었거나 아직 준비되지 않은 페이지예요." action={<Link href="/posts" className="button button--primary">게시글로 돌아가기</Link>} />;
}
