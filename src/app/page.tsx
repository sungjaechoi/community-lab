export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl space-y-5">
        <p className="text-sm font-semibold tracking-widest text-blue-700">
          COMMUNITY LAB
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          이야기를 나누고,
          <br />
          관계를 이어 가는 곳
        </h1>
        <p className="text-base leading-7 text-slate-600">
          게시글과 댓글, 친구와의 대화를 차근차근 준비하고 있어요.
        </p>
        <p className="text-sm text-slate-500">곧 만나요.</p>
      </div>
    </main>
  );
}
