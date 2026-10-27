import { createHash, createHmac, pbkdf2Sync, randomBytes, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Client } from "pg";
import { loadToolEnvironment, readDrizzleSettings, runtimeRole } from "../src/db/settings";
import { safeFailure, SetupError } from "../src/lib/database/config";

const root = resolve(__dirname, "..");

function scramVerifier(password: string) {
  const salt = randomBytes(16);
  const salted = pbkdf2Sync(password, salt, 4096, 32, "sha256");
  const clientKey = createHmac("sha256", salted).update("Client Key").digest();
  const stored = createHash("sha256").update(clientKey).digest("base64");
  const server = createHmac("sha256", salted).update("Server Key").digest("base64");
  return `SCRAM-SHA-256$4096:${salt.toString("base64")}$${stored}:${server}`;
}

async function main() {
  loadToolEnvironment(root);
  const settings = readDrizzleSettings(process.env, "migration", root);
  const environment = settings.environment;
  const path = resolve(root, environment === "test" ? ".env.test.local" : ".env.local");
  const before = readFileSync(path, "utf8");
  const credentialFile = resolve(root, `.secrets/runtime-${environment}.json`);
  const base = new URL(process.env.DATABASE_URL || "");
  const username = environment === "test" ? runtimeRole : `${runtimeRole}.${settings.projectRef}`;
  const allowedBefore = environment === "test" ? "postgres" : `postgres.${settings.projectRef}`;
  const hadRuntimeBefore = decodeURIComponent(base.username) === username;
  if (![username, allowedBefore].includes(decodeURIComponent(base.username))) {
    throw new SetupError("DB_ROLE", "기존 runtime 역할이 다릅니다. 값을 보존하고 중단했습니다.");
  }
  let runtimeUrl: string;
  if (existsSync(credentialFile)) {
    runtimeUrl = JSON.parse(readFileSync(credentialFile, "utf8")).url;
  } else {
    if (decodeURIComponent(base.username) !== username) {
      base.username = username;
      base.password = randomBytes(32).toString("base64url");
    }
    runtimeUrl = base.toString();
  }
  // Validate the recovered/new URL before changing any role or environment file.
  readDrizzleSettings({ ...process.env, DATABASE_URL: runtimeUrl }, "runtime", root);
  mkdirSync(resolve(root, ".secrets"), { recursive: true, mode: 0o700 });
  const client = new Client(settings.config);
  try {
    await client.connect();
    const existing = await client.query<{ marker: string | null }>(
      "SELECT shobj_description(oid, 'pg_authid') AS marker FROM pg_roles WHERE rolname=$1", [runtimeRole],
    );
    if (existing.rowCount && (existing.rows[0].marker !== "community-lab:runtime:step05" ||
        (!existsSync(credentialFile) && !hadRuntimeBefore))) {
      throw new SetupError("DB_ROLE_EXISTS", "소유·자격 증명을 확인하지 못한 기존 역할을 보존하고 중단했습니다.");
    }
    // Save recovery credentials before committing role creation. Never print them.
    if (!existsSync(credentialFile)) {
      writeFileSync(credentialFile, JSON.stringify({ url: runtimeUrl }), { mode: 0o600, flag: "wx" });
    }
    if (!existing.rowCount) {
      await client.query("BEGIN");
      try {
        await client.query(readFileSync(resolve(root, "infra/database/runtime-role.sql"), "utf8"));
        const verifier = scramVerifier(decodeURIComponent(new URL(runtimeUrl).password));
        // Only the verifier is sent, not the plaintext password. No query logging.
        await client.query(`ALTER ROLE community_lab_runtime PASSWORD '${verifier.replaceAll("'", "''")}'`);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
  // Check authentication independently before switching the app's runtime URL.
  const runtime = new Client(readDrizzleSettings({ ...process.env, DATABASE_URL: runtimeUrl }, "runtime", root).config);
  try {
    await runtime.connect();
    const result = await runtime.query("SELECT current_user AS role");
    if (result.rows[0]?.role !== runtimeRole) throw new SetupError("DB_ROLE", "실제 runtime 역할이 다릅니다.");
  } finally {
    await runtime.end();
  }
  let after = before;
  for (const [name, value] of Object.entries({ DATABASE_URL: runtimeUrl, COMMUNITY_LAB_DB_ENV: environment })) {
    const pattern = new RegExp(`^${name}=.*$`, "m");
    after = pattern.test(after) ? after.replace(pattern, () => `${name}=${value}`) : `${after.trimEnd()}\n${name}=${value}\n`;
  }
  if (readFileSync(path, "utf8") !== before) throw new SetupError("ENV_CHANGED", "환경 파일 변경을 감지해 보존했습니다.");
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, after, { mode: 0o600, flag: "wx" });
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
  console.log(JSON.stringify({ status: "ok", environment, runtimeRole, credentialsPrinted: false }));
}

main().catch((error: unknown) => {
  console.error(JSON.stringify({ status: "error", ...safeFailure(error) }));
  process.exitCode = 1;
});
