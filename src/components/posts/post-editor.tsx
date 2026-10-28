"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeading } from "../page-heading";
import { Button } from "../ui/button";
import { TextField } from "../ui/text-field";
import { StatePanel } from "../ui/state-panel";
import { previewPost } from "./preview";

export function PostEditor({ id }: { id?: string }) {
  if (id && id !== previewPost.id) return <StatePanel kind="preparing" title="게시글 API 연결 전이에요" description="현재는 실제 게시글을 조회하거나 수정하지 않아요." action={<Link className="button button--secondary" href={`/posts/${previewPost.id}/edit`}>수정 화면 미리보기</Link>} />;
  return <PostForm key={id ?? "new"} editing={!!id} />;
}

function PostForm({ editing }: { editing: boolean }) {
  const [title, setTitle] = useState(editing ? previewPost.title : "");
  const [body, setBody] = useState(editing ? previewPost.body : "");
  const back = editing ? `/posts/${previewPost.id}` : "/posts";
  return <div className="post-page"><Link className="text-link post-back" href={back}>← {editing ? "글로 돌아가기" : "모든 이야기"}</Link>
    <PageHeading eyebrow={editing ? "EDIT YOUR STORY" : "SHARE YOUR STORY"} title={editing ? "이야기 다듬기" : "새 이야기 쓰기"} description={editing ? "더하고 싶은 생각을 담아 주세요." : "작은 발견도, 함께 풀고 싶은 질문도 좋아요."} />
    <form className="feature-card post-form" onSubmit={(event) => event.preventDefault()}>
      <TextField id="post-title" label="제목" name="title" value={title} onChange={(event) => setTitle(event.target.value)} hint={`제목 입력 예시 · 현재 ${Array.from(title).length}자`} placeholder="어떤 이야기를 나누고 싶나요?" />
      <div className="field"><label className="field__label" htmlFor="post-body">본문</label><p id="post-body-hint" className="field__hint">현재 {Array.from(body).length.toLocaleString("ko-KR")}자. 줄바꿈은 그대로 보여요.</p><textarea id="post-body" className="field__input post-textarea" name="body" value={body} onChange={(event) => setBody(event.target.value)} aria-describedby="post-body-hint" placeholder="당신의 경험과 생각을 들려주세요." /></div>
      <p className="post-form-note" id="post-preview-note">API 연결 전 화면 미리보기입니다. 입력은 이 탭에만 남고 서버에 저장되지 않아요. 새로고침하거나 다른 화면으로 이동하면 사라져요.</p>
      <div className="post-form-footer"><Link className="button button--ghost" href={back}>취소</Link><Button type="submit" disabled aria-describedby="post-preview-note">{editing ? "수정 저장" : "게시하기"}</Button></div>
      <p className="post-submit-status" role="status">게시글 API를 연결하면 저장할 수 있어요.</p>
    </form>
  </div>;
}
