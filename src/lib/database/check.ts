import { Pool } from "pg";
import { readDatabaseSettings, SetupError, type ConnectionTarget } from "./config";

export async function checkDatabase(
  env: Record<string, string | undefined>, target: ConnectionTarget, root: string,
) {
  const { projectRef, mode, expectedRole, config } = readDatabaseSettings(env, target, root);
  const pool = new Pool(config);
  // 유휴 연결 오류가 비밀값을 포함한 미처리 이벤트로 출력되지 않게 한다.
  pool.on("error", () => {});
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN READ ONLY");
      await client.query("SET LOCAL statement_timeout = '5s'");
      const { rows } = await client.query<{
        connection_ok: number; database: string; role: string; tls: boolean; read_only: string;
      }>(`SELECT 1 AS connection_ok, current_database() AS database,
        current_user AS role, current_setting('transaction_read_only') AS read_only,
        (SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()) AS tls`);
      const row = rows[0];
      if (row?.connection_ok !== 1 || row.database !== "postgres" || row.role !== expectedRole || row.read_only !== "on") {
        throw new SetupError("DB_CHECK_FAILED", "DB 대상·역할·읽기 전용 상태가 기대와 다릅니다.");
      }
      await client.query("COMMIT");
      return { status: "ok" as const, target, projectRef, mode,
        database: row.database, role: row.role, clientTlsVerified: true, backendTls: row.tls, readOnly: true };
    } finally {
      // 짧은 점검이므로 실패한 트랜잭션도 연결과 함께 폐기한다.
      client.release(true);
    }
  } finally {
    await pool.end();
  }
}
