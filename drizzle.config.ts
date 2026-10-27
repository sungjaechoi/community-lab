import { defineConfig } from "drizzle-kit";
import { loadToolEnvironment, readDrizzleSettings } from "./src/db/settings";
import { safeFailure } from "./src/lib/database/config";

function configuration() {
  try {
    loadToolEnvironment(process.cwd());
    const { config } = readDrizzleSettings(process.env, "migration", process.cwd());
    return defineConfig({
      dialect: "postgresql",
      schema: "./src/db/schema/index.ts",
      out: "./drizzle",
      schemaFilter: ["public"],
      migrations: { schema: "drizzle", table: "__drizzle_migrations" },
      dbCredentials: {
        host: config.host!, port: config.port!, user: config.user!,
        password: String(config.password), database: config.database!, ssl: config.ssl,
      },
      verbose: false,
      strict: true,
    });
  } catch (error) {
    const failure = safeFailure(error);
    throw new Error(`${failure.code}: ${failure.message}`);
  }
}

export default configuration();
