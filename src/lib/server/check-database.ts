import "server-only";
import { sql } from "drizzle-orm";
import { getDatabase } from "../../db";
import { runtimeRole } from "../../db/settings";
import { safeFailure, SetupError } from "../database/config";

export async function checkRuntimeDatabase() {
  try {
    await getDatabase().transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL statement_timeout = '5s'`);
      const { rows } = await tx.execute<{ role: string; database: string }>(
        sql`SELECT current_user AS role, current_database() AS database`,
      );
      if (rows[0]?.role !== runtimeRole || rows[0]?.database !== "postgres") {
        throw new SetupError("DB_ROLE", "앱의 실제 DB 역할을 확인하세요.");
      }
    }, { accessMode: "read only" });
    return { status: "ok" as const };
  } catch (error) {
    return { status: "error" as const, ...safeFailure(error) };
  }
}
