import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { readDrizzleSettings } from "./settings";
import * as schema from "./schema";
import type { ConnectionTarget } from "../lib/database/config";

// Node.js server/CLI only. Browser entry points must never import this module.
export function createDatabase(
  env: Record<string, string | undefined>, target: ConnectionTarget, root: string,
) {
  const settings = readDrizzleSettings(env, target, root);
  const pool = new Pool({ ...settings.config, application_name: `community-lab-${target}` });
  pool.on("error", () => {});
  return { db: drizzle({ client: pool, schema, logger: false }), pool, settings };
}
