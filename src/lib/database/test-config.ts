import type { PoolConfig } from "pg";
import { SetupError, type ConnectionTarget } from "./config";

export function readLocalTestSettings(env: Record<string, string | undefined>, target: ConnectionTarget = "migration") {
  if (env.LOCAL_SUPABASE_PROJECT_ID !== "community-lab-test") {
    throw new SetupError("TEST_TARGET", "분리 테스트 프로젝트 표시가 필요합니다.");
  }
  let api: URL;
  let database: URL;
  try {
    api = new URL(env.NEXT_PUBLIC_SUPABASE_URL || "");
    database = new URL((target === "runtime" ? env.DATABASE_URL : env.MIGRATION_DATABASE_URL || env.DATABASE_URL) || "");
  } catch {
    throw new SetupError("TEST_TARGET", "분리 테스트의 API·DB 주소가 필요합니다.");
  }
  // 이 검사기는 고정한 로컬 스택만 허용한다. 개발/운영 URL로 대체하지 않는다.
  if (api.protocol !== "http:" || api.hostname !== "127.0.0.1" || api.port !== "54321" ||
      api.username || api.password || api.pathname !== "/" || api.search || api.hash ||
      !["postgres:", "postgresql:"].includes(database.protocol) || database.hostname !== "127.0.0.1" ||
      database.port !== "54322" || database.pathname !== "/postgres" ||
      database.username !== (target === "runtime" ? "community_lab_runtime" : "postgres") ||
      !database.password || database.search || database.hash || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new SetupError("TEST_TARGET", "고정된 로컬 테스트 주소만 허용합니다. 개발 DB로 연결하지 않습니다.");
  }
  let password: string;
  try {
    password = decodeURIComponent(database.password);
  } catch {
    throw new SetupError("TEST_TARGET", "로컬 테스트 비밀번호의 URI 형식을 확인하세요.");
  }
  const config: PoolConfig = {
    host: "127.0.0.1", port: 54322, database: "postgres", user: database.username, password,
    ssl: false, // 전용 Docker 스택의 로컬 포트만 허용한 뒤 사용한다. 클라우드 설정은 별개다.
    max: 1, connectionTimeoutMillis: 8_000, query_timeout: 10_000,
  };
  return { apiUrl: api.origin, publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, config };
}
