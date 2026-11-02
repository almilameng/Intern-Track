import { getMigrations } from "better-auth/db/migration";
import { auth, authPool } from "../src/lib/auth";

async function main() {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
    throw new Error(
      "Configure DATABASE_URL and BETTER_AUTH_SECRET before migrating.",
    );
  }
  const migration = await getMigrations(auth.options);
  await migration.runMigrations();
  await authPool.query(`CREATE TABLE IF NOT EXISTS applications (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    data jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  await authPool.query(
    "CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications(user_id)",
  );
  console.log("Account, session, and application tables are ready.");
}
main()
  .catch(() => {
    console.error(
      "Database setup failed. Check the database connection and auth environment settings.",
    );
    process.exitCode = 1;
  })
  .finally(() => authPool.end());
