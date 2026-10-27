import { loadEnvConfig } from "@next/env";
import { resolve } from "node:path";
import { checkDatabase } from "../src/lib/database/check";
import { readDatabaseSettings, safeFailure, type ConnectionTarget } from "../src/lib/database/config";

async function main() {
  const root = resolve(__dirname, "..");
  // Next 밖의 스크립트도 앱 루트의 개발 환경을 명시해서 읽는다.
  const args = process.argv.slice(2);
  const allowed = ["--env-only", "--runtime", "--migration"];
  if (args.some((arg) => !allowed.includes(arg)) ||
      (args.includes("--runtime") && args.includes("--migration")) || (process.env.NODE_ENV && process.env.NODE_ENV !== "development")) {
    console.error(JSON.stringify({ code: "ARGUMENT", message: "개발용 검사입니다. --env-only / --runtime / --migration만 지원합니다." }));
    process.exitCode = 1;
  } else {
    loadEnvConfig(root, true, { info() {}, error() {} });
    const targets: ConnectionTarget[] = args.includes("--runtime") ? ["runtime"] : args.includes("--migration") ? ["migration"] : ["runtime", "migration"];
    for (const target of targets) {
      try {
        if (args.includes("--env-only")) {
          const { projectRef, mode } = readDatabaseSettings(process.env, target, root);
          console.log(JSON.stringify({ status: "configured", target, projectRef, mode, connected: false }));
        } else {
          console.log(JSON.stringify(await checkDatabase(process.env, target, root)));
        }
      } catch (error) {
        console.error(JSON.stringify({ status: "error", target, ...safeFailure(error) }));
        process.exitCode = 1;
      }
    }
  }
}

main().catch((error: unknown) => {
  console.error(JSON.stringify({ status: "error", ...safeFailure(error) }));
  process.exitCode = 1;
});
