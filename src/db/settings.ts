import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { readDatabaseSettings, SetupError, type ConnectionTarget } from "../lib/database/config";
import { readLocalTestSettings } from "../lib/database/test-config";

export const runtimeRole = "community_lab_runtime";
export const developmentProjectRef = "awqctedxgsjyqkswogdu";

export function loadToolEnvironment(root: string) {
  const environment = process.env.COMMUNITY_LAB_DB_ENV;
  if ((environment !== "development" && environment !== "test") ||
      (environment === "test" && process.env.NODE_ENV !== "test") ||
      (environment === "development" && process.env.NODE_ENV && process.env.NODE_ENV !== "development")) {
    throw new SetupError("DB_ENVIRONMENT", "도구는 development 또는 NODE_ENV=test의 test를 명시해야 합니다.");
  }
  const file = environment === "test" ? ".env.test.local" : ".env.local";
  if (!existsSync(resolve(root, file))) {
    throw new SetupError("DB_ENVIRONMENT", "선택한 환경 파일이 없습니다. 다른 환경으로 대체하지 않습니다.");
  }
  loadEnvConfig(root, environment === "development", { info() {}, error() {} });
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
  if (environment === "test") {
    if (!env.MIGRATION_DATABASE_URL) {
      throw new SetupError("DB_ROLE", "테스트 migration 주소를 별도로 명시하세요.");
    }
    const { config } = readLocalTestSettings(env, target);
    return { environment, projectRef: "local-test", mode: "direct", expectedRole: config.user!, config };
  }
  throw new SetupError("DB_ENVIRONMENT", "DB 환경을 development 또는 test로 명시하세요.");
}
