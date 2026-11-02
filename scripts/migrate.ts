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
  await authPool.query(`CREATE TABLE IF NOT EXISTS memberships (
    user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    is_demo boolean NOT NULL DEFAULT false,
    paid boolean NOT NULL DEFAULT false,
    stripe_customer_id text UNIQUE,
    stripe_subscription_id text,
    event_created bigint NOT NULL DEFAULT 0
  )`);
  await authPool.query(`CREATE TABLE IF NOT EXISTS resumes (
    user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    version text NOT NULL, filename text NOT NULL, profile jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  await authPool.query(`CREATE TABLE IF NOT EXISTS matches (
    application_id text PRIMARY KEY REFERENCES applications(id) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    resume_version text NOT NULL, job_description text NOT NULL,
    result jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
  )`);
  await authPool.query(`CREATE TABLE IF NOT EXISTS ai_usage (
    bucket text NOT NULL, day date NOT NULL DEFAULT CURRENT_DATE,
    count integer NOT NULL DEFAULT 0, PRIMARY KEY(bucket, day)
  )`);
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
