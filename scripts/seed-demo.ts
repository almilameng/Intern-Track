import { auth, authPool } from "../src/lib/auth";
import { randomUUID } from "node:crypto";
async function main() {
  let rows = (
    await authPool.query('SELECT id, name FROM "user" WHERE email = $1', [
      "demo@demo.com",
    ])
  ).rows;
  if (!rows.length) {
    await auth.api.signUpEmail({
      body: {
        email: "demo@demo.com",
        password: "password123!",
        name: "Demo Workspace",
      },
    });
    rows = (
      await authPool.query('SELECT id, name FROM "user" WHERE email = $1', [
        "demo@demo.com",
      ])
    ).rows;
  }
  if (rows[0]?.name !== "Demo Workspace")
    throw new Error("Existing account requires review");
  await authPool.query(
    'UPDATE "user" SET "emailVerified" = true WHERE id = $1',
    [rows[0].id],
  );
  await authPool.query(
    "INSERT INTO memberships (user_id, is_demo, paid) VALUES ($1, true, true) ON CONFLICT (user_id) DO UPDATE SET is_demo = true, paid = true",
    [rows[0].id],
  );
  const userId = rows[0].id;
  const existing = await authPool.query(
    "SELECT id FROM applications WHERE user_id = $1 LIMIT 1",
    [userId],
  );
  if (!existing.rows.length) {
    const sample = {
      id: randomUUID(),
      company: "Example Analytics (sample)",
      position: "Data Analyst Intern",
      location: "Remote",
      deadline: "",
      status: "Wishlist",
      notes: "Fictional example for exploring InternTrack.",
      appliedOn: "",
      interviewAt: "",
      interviewTimezone: "America/New_York",
      jobDescription:
        "Seeking a computer science or related degree student for a data analyst internship. Responsibilities include cleaning datasets with Python, writing SQL queries, building dashboards, and explaining findings to teammates. Coursework or project experience is welcome. Cloud deployment is a plus.",
    };
    await authPool.query(
      "INSERT INTO applications (id,user_id,data) VALUES ($1,$2,$3::jsonb)",
      [sample.id, userId, JSON.stringify(sample)],
    );
  }
  const profile = {
    isResume: true,
    summary:
      "Fictional sample: computer science student with Python and SQL project experience.",
    education: ["BS Computer Science student (fictional example)"],
    skills: ["Python", "SQL", "Data visualization", "Teamwork"],
    experience: [
      "Built a coursework dashboard using Python and SQL to summarize a public dataset.",
      "Collaborated on a student software project and documented the results.",
    ],
  };
  await authPool.query(
    "INSERT INTO resumes (user_id,version,filename,profile) VALUES ($1,$2,$3,$4::jsonb) ON CONFLICT DO NOTHING",
    [
      userId,
      randomUUID(),
      "Fictional sample resume - demo",
      JSON.stringify(profile),
    ],
  );
  console.log(
    "Demo account exists, is verified, and has Pro access with labeled fictional examples.",
  );
}
main()
  .catch(() => {
    console.error(
      "Demo setup failed; review the existing account and database setup.",
    );
    process.exitCode = 1;
  })
  .finally(() => authPool.end());
