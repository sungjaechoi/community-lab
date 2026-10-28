import Link from "next/link";
import { Button } from "../ui/button";
import { StatePanel } from "../ui/state-panel";
import { previewPost } from "./preview";

export function PostDetail({ id }: { id: string }) {
  const preview = id === previewPost.id;
  return <div className="post-page"><Link className="text-link post-back" href="/posts">← 모든 이야기</Link>
    {!preview ? <StatePanel kind="preparing" title="게시글 API 연결 전이에요" description="현재는 실제 게시글을 조회하지 않아요. 기존 상세 화면은 미리보기에서 확인할 수 있어요." action={<Link className="button button--secondary" href={`/posts/${previewPost.id}`}>상세 화면 미리보기</Link>} /> : <article className="feature-card post-article">
      <div className="post-article-heading"><p className="eyebrow">COMMUNITY STORY</p><h1>{previewPost.title}</h1><div className="post-meta"><strong>{previewPost.authorName}</strong><span>화면 예시 <time dateTime={previewPost.createdAt}>2026. 10. 28.</time></span></div></div>
      <div className="post-body">{previewPost.body}</div>
      <div className="post-article-footer"><p id="post-preview-note">API 연결 전 미리보기이며 실제 데이터는 없어요.</p><div className="post-actions"><Link className="button button--secondary" href={`/posts/${previewPost.id}/edit`}>수정</Link><Button variant="danger" disabled aria-describedby="post-preview-note">삭제</Button></div></div>
    </article>}
  </div>;
}
