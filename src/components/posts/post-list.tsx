import Link from "next/link";
import { StatePanel } from "../ui/state-panel";
import { WritePostLink } from "./post-access";
import { previewPost } from "./preview";

export function PostList() {
  return <section className="feature-card posts-card" aria-labelledby="all-posts-title">
    <div className="section-heading"><div className="section-title"><h2 id="all-posts-title">모든 이야기</h2><span className="status-badge">최신순</span></div><WritePostLink /></div>
    <StatePanel kind="empty" title="첫 이야기를 기다리고 있어요" description="현재는 API 연결 전 화면 미리보기입니다. 실제 게시글 목록을 조회하지 않아요." action={<WritePostLink />} />
    <p className="card-footnote">기존 화면은 유지하고, 게시글 기능은 백엔드 학습 후 연결할 예정입니다.</p>
    <div className="post-article-footer"><Link className="text-link" href={`/posts/${previewPost.id}`}>상세 화면 미리보기</Link><Link className="text-link" href={`/posts/${previewPost.id}/edit`}>수정 화면 미리보기</Link><Link className="text-link" href="/posts/new">작성 화면 미리보기</Link></div>
  </section>;
}
