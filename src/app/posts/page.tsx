import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "게시글" };

export default function PostsPage() {
  return (
    <>
      <PageHeading eyebrow="OUR COMMUNITY" title="게시글" description="생각을 나누면, 이야기는 조금 더 넓어져요." />
      <section className="welcome-banner" aria-labelledby="welcome-title">
        <div className="welcome-copy"><span className="welcome-label"><span />반가워요, 여기는 Community Lab</span><h2 id="welcome-title">작은 이야기가<br />새로운 연결이 되는 곳.</h2><p>오늘의 발견, 풀리지 않는 질문, 문득 떠오른 생각.<br className="desktop-break" /> 당신의 이야기를 함께 나눠요.</p></div>
        <div className="welcome-art" aria-hidden="true"><span className="art-orbit" /><div className="art-card art-card--back" /><div className="art-card art-card--front"><span className="art-quote">“</span><span className="art-line" /><span className="art-line art-line--short" /><div className="art-people"><i /><i /><i /></div></div><span className="art-bubble">이야기 + 이야기</span><span className="art-spark">✦</span></div>
      </section>
      <div className="content-grid">
        <section className="feature-card posts-card" aria-labelledby="all-posts-title">
          <div className="section-heading"><div className="section-title"><h2 id="all-posts-title">모든 이야기</h2><span className="status-badge"><span />준비 중</span></div><Button disabled aria-describedby="writing-status"><span aria-hidden="true">＋</span> 글쓰기</Button></div>
          <StatePanel kind="preparing" title="곧, 이곳에서 이야기를 만나요" description="일상의 생각부터 새롭게 알게 된 것까지. 서로의 이야기를 나누는 공간을 준비하고 있어요." action={<Link href="/login" className="button button--secondary">로그인 안내</Link>} />
          <p className="card-footnote" id="writing-status">게시글 읽기와 쓰기 기능을 준비하고 있어요.</p>
        </section>
        <aside className="community-sidebar" aria-label="커뮤니티 소개">
          <section className="sidebar-note"><span className="note-icon" aria-hidden="true">✦</span><h2>어떤 이야기든<br />좋은 시작이 될 거예요.</h2><p>거창하지 않아도 괜찮아요.<br />작은 경험에서 대화가 시작되니까요.</p><ul><li><span aria-hidden="true">01</span>오늘을 담은 짧은 기록</li><li><span aria-hidden="true">02</span>함께 풀고 싶은 질문</li><li><span aria-hidden="true">03</span>직접 해보며 배운 경험</li></ul></section>
          <p className="community-promise">좋은 대화의 시작은,<br /><strong>서로를 존중하는 마음</strong>입니다.</p>
        </aside>
      </div>
    </>
  );
}
