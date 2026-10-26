"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatePanel } from "@/components/ui/state-panel";
import { TextField } from "@/components/ui/text-field";

export function PreviewClient() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [titleError, setTitleError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [retried, setRetried] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pendingTimer.current !== null) clearTimeout(pendingTimer.current);
    };
  }, []);

  function checkInput(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingTimer.current !== null) return;

    setFeedback("");
    const titleLength = Array.from(title.trim()).length;
    if (titleLength < 1 || titleLength > 100) {
      setTitleError(
        titleLength < 1
          ? "제목을 입력해 주세요. 공백만 입력할 수는 없어요."
          : "제목은 100자 이내로 입력해 주세요.",
      );
      titleRef.current?.focus();
      return;
    }

    setTitleError("");
    setPending(true);
    pendingTimer.current = setTimeout(() => {
      pendingTimer.current = null;
      setPending(false);
      setFeedback("입력 형식을 확인했어요. 서버에는 저장하지 않았습니다.");
    }, 1000);
  }

  function clearExample() {
    setTitle("");
    setBody("");
    setTitleError("");
    setFeedback("이 화면에 입력한 예시 내용을 지웠어요.");
    setConfirmOpen(false);
  }

  return (
    <div className="preview-grid">
      <header className="preview-notice">
        <p>개발 중 공통 화면 검토</p>
        <h1>기본 요소를 확인해 보세요</h1>
        <p>
          아래는 입력과 상태 표현을 확인하기 위한 예시입니다. 실제 게시글이나
          회원 데이터가 없으며 API 요청도 보내지 않습니다. 새로고침하면 입력이
          사라집니다.
        </p>
      </header>

      <section className="preview-card" aria-labelledby="preview-form-title">
        <h2 id="preview-form-title">입력 오류와 지우기 확인</h2>
        <p>
          제목을 비워 둔 채 확인하거나 100자를 넘겨 입력해 보세요. 본문 입력은
          오류가 생겨도 유지됩니다.
        </p>
        <form className="preview-form" onSubmit={checkInput} noValidate>
          <TextField
            ref={titleRef}
            id="preview-title"
            name="preview-title"
            label="제목 입력 예시"
            hint="앞뒤 공백을 제외하고 1~100자. 이모지는 유니코드 코드 포인트 단위로 셉니다."
            error={titleError}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            readOnly={pending}
            autoComplete="off"
            required
          />
          <div className="field">
            <label className="field__label" htmlFor="preview-body">
              본문 입력 예시
            </label>
            <p className="field__hint" id="preview-body-hint">
              이 내용은 현재 화면에만 보관되며 서버로 전송하지 않습니다.
            </p>
            <textarea
              id="preview-body"
              name="preview-body"
              className="field__input"
              aria-describedby="preview-body-hint"
              rows={4}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              readOnly={pending}
            />
          </div>
          <div className="preview-actions">
            <Button type="submit" pending={pending}>
              {pending ? "확인 중…" : "입력 확인"}
            </Button>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => setConfirmOpen(true)}
            >
              예시 입력 지우기
            </Button>
          </div>
          <p className="preview-feedback" role="status" aria-live="polite">
            {feedback ||
              (pending
                ? "처리 중 버튼이 잠시 비활성화됩니다. 약 1초 뒤 완료됩니다."
                : "검토용 입력이며 게시글을 작성하거나 저장하지 않습니다.")}
          </p>
        </form>
      </section>

      <section className="preview-card" aria-labelledby="preview-states-title">
        <h2 id="preview-states-title">공통 상태 표현</h2>
        <p>모두 검토용 상태 예시이며 실제 조회 결과나 권한 판정이 아닙니다.</p>
        <div className="preview-form">
          <StatePanel
            kind="loading"
            title="내용을 불러오고 있어요"
            description="로딩 안내 예시입니다. 현재 실행 중인 조회 요청은 없습니다."
          />
          <StatePanel
            kind="empty"
            title="표시할 내용이 없어요"
            description="빈 결과의 안내 예시입니다. 실제 게시글 목록을 조회한 결과는 아닙니다."
          />
          {retried ? (
            <StatePanel
              kind="preparing"
              title="재시도 동작을 확인했어요"
              description="버튼으로 이 화면의 상태만 바뀌었습니다. 서버 요청은 보내지 않았습니다."
              action={
                <Button variant="secondary" onClick={() => setRetried(false)}>
                  오류 예시 다시 보기
                </Button>
              }
            />
          ) : (
            <StatePanel
              kind="error"
              title="내용을 불러오지 못했어요"
              description="오류와 재시도 버튼의 예시입니다. 실제 API 오류가 발생한 것은 아닙니다."
              action={
                <Button variant="secondary" onClick={() => setRetried(true)}>
                  다시 시도
                </Button>
              }
            />
          )}
          <StatePanel
            kind="forbidden"
            title="이 내용을 볼 수 없어요"
            description="권한 안내 예시입니다. 실제 로그인이나 접근 권한 검사는 아직 연결하지 않았습니다."
          />
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="예시 입력을 지울까요?"
        description="현재 화면에 입력한 제목과 본문만 지웁니다. 지운 내용은 되돌릴 수 없으며 서버 데이터에는 영향을 주지 않습니다."
        confirmLabel="예시 입력 지우기"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={clearExample}
      />
    </div>
  );
}
