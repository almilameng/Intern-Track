import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { membership } from "@/lib/access";
import MatchWorkspace from "@/components/match-workspace";
import type { Profile, Match } from "@/lib/ai-types";
import type { Application } from "@/lib/applications";
export default async function MatchesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const sql = database();
  const [resumeRows, apps, access] = await Promise.all([
    sql`SELECT profile, filename, version FROM resumes WHERE user_id = ${session.user.id}`,
    sql`SELECT a.data, m.result, m.resume_version, m.job_description FROM applications a LEFT JOIN matches m ON m.application_id = a.id AND m.user_id = a.user_id WHERE a.user_id = ${session.user.id} ORDER BY a.created_at DESC`,
    membership(session.user.id),
  ]);
  const resume = resumeRows[0];
  return (
    <MatchWorkspace
      resume={
        resume
          ? {
              profile: resume.profile as Profile,
              filename: resume.filename as string,
            }
          : null
      }
      apps={apps.map((row) => ({
        app: row.data as Application,
        result:
          row.result &&
          resume &&
          row.resume_version === resume.version &&
          row.job_description === row.data.jobDescription
            ? (row.result as Match)
            : null,
        stale:
          !!row.result &&
          (!resume ||
            row.resume_version !== resume.version ||
            row.job_description !== row.data.jobDescription),
      }))}
      pro={access.pro}
      demo={access.demo}
    />
  );
}
