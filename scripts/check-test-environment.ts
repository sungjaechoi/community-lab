import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { safeFailure, SetupError } from "../src/lib/database/config";
import { readLocalTestSettings } from "../src/lib/database/test-config";

async function main() {
  const root = resolve(__dirname, "..");
  if (process.env.NODE_ENV !== "test") {
    throw new SetupError("TEST_MODE", "pnpm test:env:check로 명시한 테스트 환경에서 실행하세요.");
  }
  if (!existsSync(resolve(root, ".env.test.local"))) {
    throw new SetupError("TEST_ENV_MISSING", ".env.test.local을 먼저 준비하세요. 개발 환경으로 대체하지 않습니다.");
  }
  loadEnvConfig(root, false, { info() {}, error() {} });
  const { apiUrl, publishableKey, config } = readLocalTestSettings(process.env);
  const pool = new Pool(config);
  pool.on("error", () => {});
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN READ ONLY");
      await client.query("SET LOCAL statement_timeout = '5s'");
      const { rows } = await client.query<{
        connection_ok: number; database: string; role: string; auth_exists: boolean; read_only: string;
      }>(`SELECT 1 AS connection_ok, current_database() AS database, current_user AS role,
        EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'auth') AS auth_exists,
        current_setting('transaction_read_only') AS read_only`);
      const row = rows[0];
      if (row?.connection_ok !== 1 || row.database !== "postgres" || row.role !== "postgres" ||
          !row.auth_exists || row.read_only !== "on") {
        throw new SetupError("TEST_CHECK", "테스트 DB·Auth 기반·읽기 상태가 기대와 다릅니다.");
      }
      await client.query("COMMIT");
      const response = await fetch(`${apiUrl}/auth/v1/settings`, {
        headers: { apikey: publishableKey }, signal: AbortSignal.timeout(8_000),
      });
      await response.body?.cancel();
      if (!response.ok) throw new SetupError("TEST_AUTH", "분리 테스트 Auth 읽기에 실패했습니다.");
      console.log(JSON.stringify({ status: "ok", environment: "local-test", database: row.database,
        role: row.role, authSchemaExists: true, authHttpStatus: response.status, readOnly: true }));
    } finally {
      client.release(true);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(JSON.stringify({ status: "error", environment: "local-test", ...safeFailure(error) }));
  process.exitCode = 1;
});
