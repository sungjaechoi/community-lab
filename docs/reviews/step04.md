# STEP 04 검토 자료 · 현재 ERD와 설계 변화 학습

작성일: 2026-10-27 (Asia/Seoul). 후속 응답으로 **04-REVIEW 전체 승인**을 받았다. 제출 당시 자료·검증 한계는 이력으로 보존한다.

실제 응답: “04-REVIEW 전체 확인했어. 커밋·push하고 STEP 05 진행해줘. 업무 테이블은 아직 만들지 말고 도구·역할별 연결을 준비한 뒤, 05-REVIEW에서 결과를 보여주고 멈춰줘.” 승인 기록 시각은 2026-10-27 10:11:56 +09:00, 정확한 전송 시각은 제공되지 않았다. 04-REVIEW와 04-COMMIT은 DONE이다.

승인된 9개 파일을 `560f7c0402bc020d23e578fc5c51c7c8a9f2f2ac` (`docs: establish incremental ERD learning and change records`)로 커밋했다. 실제 Git 시각은 2026-10-27 10:12:28 +09:00, 같은 브랜치 push exit0·원격 해시 일치·직후 clean이었다. 현재 확인은 STEP05의 05-REVIEW이며 성공 기록은 다음 예정 05-COMMIT에 포함한다.

## 결과와 WHY

STEP 03 전체 확인 뒤 승인 범위 28개 파일을 `0dcd4b59f74e52a73dd198ecc301a45e29e9c540`로 커밋·같은 원격 브랜치에 push했다. 실제 Git 시각은 2026-10-27 10:00:12 +09:00이며 원격 해시 일치·push 직후 clean을 확인했다. 이후 이 해시 기록과 STEP 04 문서는 다음 예정 04-COMMIT에 포함한다.

이번에는 구조가 생기기 전의 **실제 기준점**을 남겼다. 앞으로 기능을 만들 때 새 테이블·컬럼·관계가 왜 추가되는지 이 기준점과 비교한다.

| 결과 | 확인할 자료 |
| --- | --- |
| 현재 실제 업무 테이블 0개, auth.users.id uuid·NOT NULL·PK 확인 | [현재 ERD](../erd.md) |
| 용어·1대다 관계·문서 전용 가상 예·서버/DB/트랜잭션의 책임 | [설계·읽기 기준](../decisions/0002-database-design.md) |
| 변경 전 → 후보·WHY → 실제 SQL·적용·검증 → 현재 그림 → API REVIEW | [기능별 이력 기준](../erd-history/README.md) |
| 같은 개발 DB에서 다시 확인하는 읽기 전용 SQL | [메타데이터 조사 SQL](../erd-inspection.sql) |

현재 ERD에는 실제 Auth 식별자만 그렸다. 가상 BOX/ITEM 그림은 학습 문서에만 있으며 프로젝트 테이블·승인된 미래 모델이 아니다.

## 실제 검증과 한계

| 확인 | 실제 결과 |
| --- | --- |
| 개발 대상·문맥 | awqctedxgsjyqkswogdu / session 관리 연결 / DB·역할 postgres / PostgreSQL17.11 |
| 읽기 전용 | REPEATABLE READ READ ONLY에서 실행, read_only=on |
| public 관계 | 테이블·분할 테이블·뷰·구체화 뷰·외부 테이블 목록 0행 |
| Auth 식별자 | auth.users.id = uuid, not_null=true, part_of_primary_key=true |
| 실제 PK | users_pkey = PRIMARY KEY(id), validated=true |
| 관리 영역 | 시스템 외 8개 스키마의 관계 개수 조사. 전체 Auth/Storage/Realtime 내부 모델 검증은 아님 |
| 문서 예제 | 읽기 설명용. 가상 DDL·입력 함수의 실제 실행/테이블 생성/제약 테스트는 수행하지 않음 |
| 현재 단계 범위 | 업무 테이블 생성·schema 파일·migration·권한 변경·ERD의 미래 관계 확정 없음 |

SQL은 사용자 데이터 행을 조회하지 않았다. 관리형 Auth의 전체 구조·실제 사용자 로그인·업무 권한/제약·동시성 검증은 이번 결과로 주장하지 않는다. 앱 코드·설정 변경이 없어 타입·린트·빌드를 반복할 필요는 없으며 기존 STEP 03 결과를 보존한다. 문서·ID·보존 검사의 실제 결과는 진행 기록을 따른다.

제출 당시 문서 검사도 통과했다. Markdown 21개·내부 링크/이미지 110개, 기존 작업 ID 259개 순서 보존·체크 54개, 기존 소스/설정/이미지 54개 SHA-256 일치를 확인했다. 그 시점에는 STEP 04 REVIEW·COMMIT과 STEP 05가 미완료였고 변경 9개는 미커밋·staged0이었다. 조사 SQL은 읽기 전용 문맥과 SELECT 5개로 구성됐고, 가상 예제를 실제 적용 파일로 만들지 않았다.

## 직접 확인할 항목

1. 현재 그림이 **업무 테이블 없음 + 관리형 Auth 일부**라는 점을 읽을 수 있는지.
2. BOX/ITEM의 가상 FK를 읽고 NOT NULL·UNIQUE·CHECK의 역할을 구분할 수 있는지. CHECK만으로 NULL이 막히지 않는 이유도 설명 문서에 있다.
3. 기능마다 변경 전·후보·적용 후 그림과 WHY·SQL·검증을 남기는 순서가 학습 목적에 맞는지.
4. STEP 05는 도구·역할별 읽기 연결, 첫 업무 테이블은 STEP 06 profiles이며 이후 기능별로 추가한다는 시점표가 맞는지.

필요하면 연결된 DBeaver나 SQL Editor에서 조사 SQL 전체를 실행해 문서의 결과와 비교한다. 가상 DDL 예제는 검토용이며 실행 대상이 아니다. 이해가 어려운 항목이나 수정 요청은 같은 04-REVIEW에서 보완한다.

제출 당시 재개 ID는 04-REVIEW였다. 이후 전체 확인·04-COMMIT·허용된 push 성공 뒤 STEP05로 진행했다. 현재·다음 재개 ID는 **05-REVIEW**다. 설명 제공과 이해·복습 완료는 구분한다.
