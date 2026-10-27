import assert from "node:assert/strict";
import test from "node:test";
import { readDatabaseSettings, safeFailure, SetupError } from "./config";
import { readLocalTestSettings } from "./test-config";

// 실제 프로젝트·비밀값이 아닌 입력 경계 검사용 자료다. 네트워크에 접속하지 않는다.
const ref = "abcdefghijklmnopqrst";
const otherRef = "zyxwvutsrqponmlkjihg";
const fixture = () => ({
  NEXT_PUBLIC_SUPABASE_URL: `https://${ref}.supabase.co`,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixture_for_tests",
  DATABASE_URL: `postgresql://postgres.${ref}:fixture@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`,
  MIGRATION_DATABASE_URL: `postgresql://postgres:fixture@db.${ref}.supabase.co:5432/postgres`,
  MIGRATION_DATABASE_CONNECTION_MODE: "direct",
});

test("빈 설정은 기본 DB로 연결하지 않고 실패한다", () => {
  assert.throws(() => readDatabaseSettings({}, "runtime", process.cwd()), { code: "ENV_MISSING" });
});

test("공개 변수에 서버 비밀키를 잘못 넣으면 거부한다", () => {
  assert.throws(() => readDatabaseSettings({ ...fixture(), NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_fixture" }, "runtime", process.cwd()), { code: "ENV_INVALID" });
});

test("다른 프로젝트의 DB 주소와 잘못된 pooler 포트를 거부한다", () => {
  const env = fixture();
  for (const url of [env.DATABASE_URL.replace(ref, otherRef), env.DATABASE_URL.replace(":6543", ":5432")]) {
    assert.throws(() => readDatabaseSettings({ ...env, DATABASE_URL: url }, "runtime", process.cwd()), { code: "TARGET_MISMATCH" });
  }
});

test("migration은 transaction pooler로 보내지 않는다", () => {
  assert.throws(() => readDatabaseSettings({ ...fixture(), MIGRATION_DATABASE_CONNECTION_MODE: "transaction" }, "migration", process.cwd()), { code: "ENV_INVALID" });
});

test("연결 URI 옵션으로 TLS 검증을 끄지 못한다", () => {
  assert.throws(() => readDatabaseSettings({ ...fixture(), DATABASE_URL: `${fixture().DATABASE_URL}?sslmode=disable` }, "runtime", process.cwd()), { code: "ENV_INVALID" });
  const { config } = readDatabaseSettings({ ...fixture(), DATABASE_URL: `${fixture().DATABASE_URL}?sslmode=require` }, "runtime", process.cwd());
  assert.deepEqual(config.ssl, { rejectUnauthorized: true });
});

test("암호의 URI 인코딩을 한 번만 풀고 원래 값을 드라이버에 전달한다", () => {
  const { config } = readDatabaseSettings({ ...fixture(), DATABASE_URL: fixture().DATABASE_URL.replace(":fixture@", ":a%40b%25c@") }, "runtime", process.cwd());
  assert.equal(config.password, "a@b%c");
});

test("실패 결과에는 드라이버의 메시지·URL·원본 코드를 노출하지 않는다", () => {
  const secretMessage = "synthetic credential must stay private";
  const failure = safeFailure(Object.assign(new Error(secretMessage), { code: "28P01", detail: secretMessage }));
  assert.equal(failure.code, "DB_AUTH");
  assert.ok(!JSON.stringify(failure).includes(secretMessage));
  assert.equal(safeFailure({ code: secretMessage }).code, "DB_CONNECTION");
  assert.equal(safeFailure(new SetupError("ENV_MISSING", "DATABASE_URL 입력이 필요합니다.")).code, "ENV_MISSING");
});

const localFixture = () => ({
  LOCAL_SUPABASE_PROJECT_ID: "community-lab-test",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "synthetic-local-public-key",
  DATABASE_URL: "postgresql://postgres:fixture@127.0.0.1:54322/postgres",
});

test("테스트 검사에는 명시한 로컬 프로젝트 표시가 필요하다", () => {
  assert.throws(() => readLocalTestSettings({ ...localFixture(), LOCAL_SUPABASE_PROJECT_ID: "" }), { code: "TEST_TARGET" });
});

test("개발 API나 개발 DB를 테스트 대상으로 잘못 넣으면 접속 전에 거부한다", () => {
  assert.throws(() => readLocalTestSettings({ ...localFixture(), NEXT_PUBLIC_SUPABASE_URL: fixture().NEXT_PUBLIC_SUPABASE_URL }), { code: "TEST_TARGET" });
  assert.throws(() => readLocalTestSettings({ ...localFixture(), DATABASE_URL: fixture().DATABASE_URL }), { code: "TEST_TARGET" });
});

test("로컬 검사도 정해진 API·DB 포트만 허용한다", () => {
  const { config } = readLocalTestSettings(localFixture());
  assert.equal(config.host, "127.0.0.1");
  assert.equal(config.port, 54322);
  assert.throws(() => readLocalTestSettings({ ...localFixture(), DATABASE_URL: localFixture().DATABASE_URL.replace(":54322", ":5432") }), { code: "TEST_TARGET" });
});
