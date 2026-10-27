import assert from "node:assert/strict";
import test from "node:test";
import { readDrizzleSettings, developmentProjectRef as ref } from "./settings";
import { safeFailure } from "../lib/database/config";

// Synthetic credentials only. These tests never connect to a DB.
const development = () => ({
  COMMUNITY_LAB_DB_ENV: "development",
  NEXT_PUBLIC_SUPABASE_URL: `https://${ref}.supabase.co`,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixture_for_tests",
  DATABASE_URL: `postgresql://community_lab_runtime.${ref}:fixture@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`,
  MIGRATION_DATABASE_URL: `postgresql://postgres.${ref}:fixture@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`,
  MIGRATION_DATABASE_CONNECTION_MODE: "session",
});
const local = () => ({
  COMMUNITY_LAB_DB_ENV: "test", LOCAL_SUPABASE_PROJECT_ID: "community-lab-test",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "synthetic-local-public-key",
  DATABASE_URL: "postgresql://community_lab_runtime:fixture@127.0.0.1:54322/postgres",
  MIGRATION_DATABASE_URL: "postgresql://postgres:fixture@127.0.0.1:54322/postgres",
});

test("환경 미지정·production은 연결 전에 거부한다", () => {
  for (const environment of [undefined, "production"]) {
    assert.throws(() => readDrizzleSettings({ ...development(), COMMUNITY_LAB_DB_ENV: environment }, "runtime", process.cwd()), { code: "DB_ENVIRONMENT" });
  }
});
test("runtime이 관리자 주소를 사용하면 거부한다", () => {
  const env = development();
  env.DATABASE_URL = env.DATABASE_URL.replace("community_lab_runtime", "postgres");
  assert.throws(() => readDrizzleSettings(env, "runtime", process.cwd()), { code: "DB_ROLE" });
});
test("migration이 runtime 역할을 사용하면 거부한다", () => {
  const env = development();
  env.MIGRATION_DATABASE_URL = env.MIGRATION_DATABASE_URL.replace("postgres.", "community_lab_runtime.");
  assert.throws(() => readDrizzleSettings(env, "migration", process.cwd()), { code: "DB_ROLE" });
});
test("공개값과 두 URI를 함께 다른 프로젝트로 바꾸어도 개발 허용 대상과 비교한다", () => {
  const env = Object.fromEntries(Object.entries(development()).map(([key, value]) => [key, value.replaceAll(ref, "abcdefghijklmnopqrst")]));
  assert.throws(() => readDrizzleSettings(env, "runtime", process.cwd()), { code: "TARGET_MISMATCH" });
});
test("테스트 두 역할을 분리하고 migration 누락을 runtime 주소로 대체하지 않는다", () => {
  assert.equal(readDrizzleSettings(local(), "runtime", process.cwd()).expectedRole, "community_lab_runtime");
  assert.equal(readDrizzleSettings(local(), "migration", process.cwd()).expectedRole, "postgres");
  assert.throws(() => readDrizzleSettings({ ...local(), MIGRATION_DATABASE_URL: "" }, "migration", process.cwd()), { code: "DB_ROLE" });
});
test("테스트 연결에 개발 주소를 넣으면 거부한다", () => {
  assert.throws(() => readDrizzleSettings({ ...local(), DATABASE_URL: development().DATABASE_URL }, "runtime", process.cwd()), { code: "TEST_TARGET" });
  assert.throws(() => readDrizzleSettings({ ...local(), MIGRATION_DATABASE_URL: development().MIGRATION_DATABASE_URL }, "migration", process.cwd()), { code: "TEST_TARGET" });
});
test("Drizzle이 감싼 오류에서도 분류만 전달하며 SQL·비밀은 숨긴다", () => {
  const cause = Object.assign(new Error("synthetic-private-driver-message"), { code: "42501" });
  const outer = new Error("synthetic-private-query", { cause });
  const result = safeFailure(outer);
  assert.equal(result.code, "DB_PERMISSION");
  assert.ok(!JSON.stringify(result).includes("synthetic-private"));
});
