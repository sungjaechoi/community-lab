import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { readDatabaseSettings, SetupError, type ConnectionTarget } from "../lib/database/config";

export const runtimeRole = "community_lab_runtime";
export const developmentProjectRef = "awqctedxgsjyqkswogdu";

export function loadToolEnvironment(root: string) {
  const environment = process.env.COMMUNITY_LAB_DB_ENV;
  if (environment !== "development" ||
      (process.env.NODE_ENV && process.env.NODE_ENV !== "development")) {
    throw new SetupError("DB_ENVIRONMENT", "현재 도구는 등록된 development 환경에서만 실행합니다.");
  }
  if (!existsSync(resolve(root, ".env.local"))) {
    throw new SetupError("DB_ENVIRONMENT", ".env.local 환경 파일이 없습니다.");
  }
  loadEnvConfig(root, true, { info() {}, error() {} });
}

export function readDrizzleSettings(
  env: Record<string, string | undefined>, target: ConnectionTarget, root: string,
) {
  const environment = env.COMMUNITY_LAB_DB_ENV;
  if (environment === "development") {
    const settings = readDatabaseSettings(env, target, root);
    if (settings.projectRef !== developmentProjectRef) {
      throw new SetupError("TARGET_MISMATCH", "등록된 개발 프로젝트만 허용합니다.");
    }
    if (settings.expectedRole !== (target === "runtime" ? runtimeRole : "postgres")) {
      throw new SetupError("DB_ROLE", "runtime은 전용 역할, migration은 관리 역할을 사용하세요.");
    }
    return { environment, ...settings };
  }
  throw new SetupError("DB_ENVIRONMENT", "현재 DB 환경은 development만 지원합니다.");
}
