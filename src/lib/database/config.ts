import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { PoolConfig } from "pg";

type Environment = Record<string, string | undefined>;
export type ConnectionTarget = "runtime" | "migration";

export class SetupError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}

function required(env: Environment, name: string) {
  const value = env[name]?.trim();
  if (!value) throw new SetupError("ENV_MISSING", `${name} 입력이 필요합니다.`);
  return value;
}

export function readPublicSettings(env: Environment) {
  let url: URL;
  try {
    url = new URL(required(env, "NEXT_PUBLIC_SUPABASE_URL"));
  } catch (error) {
    if (error instanceof SetupError) throw error;
    throw new SetupError("ENV_INVALID", "Supabase Project URL 형식을 확인하세요.");
  }
  const match = /^([a-z0-9]{20})\.supabase\.co$/.exec(url.hostname);
  if (!match || url.protocol !== "https:" || url.username || url.password ||
      url.port || url.search || url.hash || url.pathname !== "/") {
    throw new SetupError("ENV_INVALID", "Connect의 기본 HTTPS Project URL을 사용하세요.");
  }
  if (!/^sb_publishable_[A-Za-z0-9_-]{10,}$/.test(required(env, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"))) {
    throw new SetupError("ENV_INVALID", "publishable key가 필요합니다. secret/service_role 키를 사용하지 마세요.");
  }
  return { projectRef: match[1] };
}

export function readDatabaseSettings(env: Environment, target: ConnectionTarget, root: string) {
  const { projectRef } = readPublicSettings(env);
  const name = target === "runtime" ? "DATABASE_URL" : "MIGRATION_DATABASE_URL";
  let url: URL;
  let user: string;
  let password: string;
  let database: string;
  try {
    url = new URL(required(env, name));
    user = decodeURIComponent(url.username);
    password = decodeURIComponent(url.password);
    database = decodeURIComponent(url.pathname.slice(1));
  } catch (error) {
    if (error instanceof SetupError) throw error;
    throw new SetupError("ENV_INVALID", `${name}의 URI 형식을 확인하세요. 값은 출력하지 않습니다.`);
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !user || !password ||
      !database || url.hash || /\[|\]|YOUR-PASSWORD/.test(password)) {
    throw new SetupError("ENV_INVALID", `${name}의 사용자·비밀번호·DB와 URI 인코딩을 확인하세요.`);
  }
  // pg의 connectionString 파서가 명시한 TLS 설정을 덮어쓰지 않게 분리한다.
  for (const [key, value] of url.searchParams) {
    if (key !== "sslmode" || !["require", "verify-full"].includes(value)) {
      throw new SetupError("ENV_INVALID", `${name}의 추가 옵션을 확인하세요. TLS는 코드에서 강제합니다.`);
    }
  }
  const mode = target === "runtime" ? "transaction" : required(env, "MIGRATION_DATABASE_CONNECTION_MODE");
  if (!["direct", "session", "transaction"].includes(mode) || (target === "migration" && mode === "transaction")) {
    throw new SetupError("ENV_INVALID", "migration 연결 방식은 direct 또는 session이어야 합니다.");
  }
  const direct = mode === "direct";
  const validHost = direct
    ? url.hostname === `db.${projectRef}.supabase.co`
    : /^[a-z0-9-]+\.pooler\.supabase\.com$/.test(url.hostname) && user.endsWith(`.${projectRef}`);
  const port = Number(url.port || 5432);
  if (!validHost || port !== (mode === "transaction" ? 6543 : 5432) || database !== "postgres") {
    throw new SetupError("TARGET_MISMATCH", `${name}의 프로젝트·연결 방식·포트를 Connect와 비교하세요.`);
  }
  const expectedRole = direct ? user : user.slice(0, -(projectRef.length + 1));
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(expectedRole)) {
    throw new SetupError("ENV_INVALID", `${name}의 DB 역할을 확인하세요.`);
  }

  let ca: string | undefined;
  const caPath = env[target === "runtime" ? "DATABASE_CA_CERT_PATH" : "MIGRATION_DATABASE_CA_CERT_PATH"]?.trim();
  if (caPath) {
    try {
      ca = readFileSync(resolve(root, caPath), "utf8");
    } catch {
      throw new SetupError("TLS_CA_FILE", "지정한 DB 인증서 파일을 읽을 수 없습니다.");
    }
  }
  const config: PoolConfig = {
    host: url.hostname, port, user, password, database,
    ssl: { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
    max: 1,
    connectionTimeoutMillis: 8_000,
    idleTimeoutMillis: 10_000,
    query_timeout: 10_000,
    application_name: "community-lab-connection-check",
  };
  return { projectRef, mode, expectedRole, config };
}

// DB 오류 객체에는 접속 정보가 포함될 수 있어 허용한 코드만 전달한다.
export function safeFailure(error: unknown) {
  if (error instanceof SetupError) return { code: error.code, message: error.message };
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (["28P01", "28000"].includes(code)) return { code: "DB_AUTH", message: "DB 사용자·비밀번호·프로젝트 접근을 확인하세요." };
  if (["ENOTFOUND", "EAI_AGAIN"].includes(code)) return { code: "DB_DNS", message: "Connect 호스트·프로젝트 상태·DNS를 확인하세요." };
  if (["ENETUNREACH", "EHOSTUNREACH", "ECONNREFUSED", "ETIMEDOUT", "ECONNRESET"].includes(code)) return { code: "DB_NETWORK", message: "네트워크·방화벽·IPv6 지원·연결 방식을 확인하세요." };
  if (["DEPTH_ZERO_SELF_SIGNED_CERT", "SELF_SIGNED_CERT_IN_CHAIN", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "CERT_HAS_EXPIRED", "ERR_TLS_CERT_ALTNAME_INVALID", "UNABLE_TO_GET_ISSUER_CERT_LOCALLY"].includes(code)) return { code: "DB_TLS", message: "서버 인증서와 신뢰 체인을 확인하세요. TLS 검증을 끄지 마세요." };
  if (code === "42501") return { code: "DB_PERMISSION", message: "연결 역할의 읽기 권한을 확인하세요." };
  return { code: "DB_CONNECTION", message: "연결 또는 읽기 쿼리에 실패했습니다. 시간 초과·접속 정보를 로컬에서 확인하세요." };
}
