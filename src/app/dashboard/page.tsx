import Dashboard from "@/components/dashboard";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import type { Application } from "@/lib/applications";
import { membership } from "@/lib/access";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const rows =
    await database()`SELECT data FROM applications WHERE user_id = ${session.user.id} ORDER BY created_at DESC`;
  const access = await membership(session.user.id);
  return (
    <Dashboard
      initialApplications={rows.map((row) => row.data as Application)}
      userName={session.user.name}
      pro={access.pro}
      demo={access.demo}
    />
  );
}
