import "server-only";
import { createDatabase } from "./client";

let connection: ReturnType<typeof createDatabase> | undefined;

// Lazy creation keeps builds independent from credentials and DB availability.
export function getDatabase() {
  connection ??= createDatabase(process.env, "runtime", process.cwd());
  return connection.db;
}
