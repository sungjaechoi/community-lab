import { resolve } from "node:path";
import { sql } from "drizzle-orm";
import { createDatabase } from "../src/db/client";
import { loadToolEnvironment, runtimeRole } from "../src/db/settings";
import { safeFailure, SetupError, type ConnectionTarget } from "../src/lib/database/config";

async function main() {
  const root = resolve(__dirname, "..");
  loadToolEnvironment(root);
  for (const target of ["runtime", "migration"] as ConnectionTarget[]) {
    const { db, pool, settings } = createDatabase(process.env, target, root);
    try {
      const row = await db.transaction(async (tx) => {
        await tx.execute(sql`SET LOCAL statement_timeout = '5s'`);
        const result = await tx.execute<{
          database: string; role: string; login: boolean; superuser: boolean; create_db: boolean;
          create_role: boolean; inherit: boolean; replication: boolean; bypass_rls: boolean;
          public_create: boolean; auth_usage: boolean; owned_public: number; memberships: number;
          public_relations: number; drizzle_schema: boolean; read_only: string; backend_tls: boolean;
          jwt_absent: boolean; session_role: string;
        }>(sql`SELECT current_database() AS database, current_user AS role, session_user AS session_role,
          r.rolcanlogin AS login, r.rolsuper AS superuser, r.rolcreatedb AS create_db,
          r.rolcreaterole AS create_role, r.rolinherit AS inherit, r.rolreplication AS replication,
          r.rolbypassrls AS bypass_rls, has_schema_privilege('public', 'CREATE') AS public_create,
          has_schema_privilege('auth', 'USAGE') AS auth_usage,
          (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
            WHERE n.nspname='public' AND c.relowner=r.oid) AS owned_public,
          (SELECT count(*)::int FROM pg_auth_members m WHERE m.member=r.oid) AS memberships,
          (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
            WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','f')) AS public_relations,
          EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='drizzle') AS drizzle_schema,
          current_setting('transaction_read_only') AS read_only,
          (SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()) AS backend_tls,
          COALESCE(current_setting('request.jwt.claims', true), '')='' AS jwt_absent
          FROM pg_roles r WHERE r.rolname=current_user`);
        const row = result.rows[0];
        if (!row || row.database !== "postgres" || row.role !== settings.expectedRole ||
            row.session_role !== row.role || row.read_only !== "on" ||
            (settings.environment === "development" && !row.backend_tls)) {
          throw new SetupError("DRIZZLE_CHECK", "실제 DB·역할·읽기 상태가 다릅니다.");
        }
        if (target === "runtime" && (row.role !== runtimeRole || !row.login || row.superuser ||
            row.create_db || row.create_role || row.inherit || row.replication || row.bypass_rls ||
            row.public_create || row.auth_usage || row.owned_public || row.memberships || !row.jwt_absent)) {
          throw new SetupError("DRIZZLE_ROLE", "runtime의 역할·소유권·접근 경계를 확인하세요.");
        }
        return row;
      }, { accessMode: "read only" });
      if (target === "runtime") {
        for (const query of [sql`SELECT id FROM auth.users LIMIT 0`, sql`SET ROLE postgres`]) {
          let denied = false;
          try {
            await db.transaction(async (tx) => { await tx.execute(query); }, { accessMode: "read only" });
          } catch (error) {
            if (safeFailure(error).code !== "DB_PERMISSION") throw error;
            denied = true;
          }
          if (!denied) throw new SetupError("DRIZZLE_ROLE", "runtime의 금지 작업이 거부되지 않았습니다.");
        }
      }
      console.log(JSON.stringify({ status: "ok", environment: settings.environment, target,
        projectRef: settings.projectRef, mode: settings.mode, ...row,
        ...(target === "runtime" ? { authReadDenied: true, adminRoleSwitchDenied: true } : {}),
        clientTlsVerified: settings.environment === "development" }));
    } finally {
      await pool.end();
    }
  }
}

main().catch((error: unknown) => {
  console.error(JSON.stringify({ status: "error", ...safeFailure(error) }));
  process.exitCode = 1;
});
