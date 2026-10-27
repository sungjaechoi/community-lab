import "server-only";
import { checkDatabase } from "../database/check";
import { safeFailure } from "../database/config";

export async function checkRuntimeDatabase() {
  try {
    await checkDatabase(process.env, "runtime", process.cwd());
    return { status: "ok" as const };
  } catch (error) {
    return { status: "error" as const, ...safeFailure(error) };
  }
}
