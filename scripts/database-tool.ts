import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { is } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import * as schema from "../src/db/schema";
import { safeFailure, SetupError } from "../src/lib/database/config";

async function main() {
  const action = process.argv[2];
  if (process.argv.length !== 3 || !["config", "generate", "check", "migrate"].includes(action)) {
    throw new SetupError("ARGUMENT", "config·generate·check·migrate 중 하나가 필요합니다.");
  }
  const { default: config } = await import("../drizzle.config");
  if (action === "config") {
    console.log(JSON.stringify({ status: "ok", environment: process.env.COMMUNITY_LAB_DB_ENV,
      dialect: config.dialect, schema: config.schema, out: config.out, connected: false }));
    return;
  }
  const root = resolve(__dirname, "..");
  // An intentionally empty barrel must not generate meaningless snapshots/migrations.
  const hasTables = Object.values(schema).some((value) => is(value, PgTable));
  const folder = resolve(root, "drizzle");
  const hasMigrations = existsSync(folder) && readdirSync(folder).some((name) => name.endsWith(".sql"));
  if ((action === "generate" && !hasTables) || (action !== "generate" && !hasMigrations)) {
    console.log(JSON.stringify({ status: "skipped", action, reason: "NO_BUSINESS_SCHEMA_OR_MIGRATIONS", connected: false }));
    return;
  }
  const result = spawnSync("pnpm", ["exec", "drizzle-kit", action, "--config=drizzle.config.ts"], {
    cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 60_000,
  });
  // CLI errors may embed SQL and credentials. Do not forward raw stdout/stderr.
  if (result.error || result.status !== 0) {
    throw new SetupError("DRIZZLE_COMMAND", "Drizzle 명령이 실패했습니다. SQL·대상·이력을 점검하세요. 원본 오류는 출력하지 않습니다.");
  }
  console.log(JSON.stringify({ status: "ok", action, environment: process.env.COMMUNITY_LAB_DB_ENV }));
}

main().catch((error: unknown) => {
  console.error(JSON.stringify({ status: "error", ...safeFailure(error) }));
  process.exitCode = 1;
});
