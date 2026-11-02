"use server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { validApplications, type Application } from "@/lib/applications";

export async function saveApplication(
  application: Application,
  creating: boolean,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Your session expired. Please log in again." };
  if (
    !validApplications([application]) ||
    !application.company.trim() ||
    !application.position.trim() ||
    application.id.length > 80 ||
    application.company.length > 120 ||
    application.position.length > 160 ||
    application.location.length > 160 ||
    application.notes.length > 10000
  ) {
    return { error: "Check the application details and try again." };
  }
  const sql = database();
  try {
    const rows = creating
      ? await sql`INSERT INTO applications (id, user_id, data) VALUES (${application.id}, ${session.user.id}, ${JSON.stringify(application)}::jsonb) ON CONFLICT DO NOTHING RETURNING id`
      : await sql`UPDATE applications SET data = ${JSON.stringify(application)}::jsonb, updated_at = now() WHERE id = ${application.id} AND user_id = ${session.user.id} RETURNING id`;
    if (!rows.length)
      return {
        error:
          "This application changed or is unavailable. Refresh and try again.",
      };
    return { success: true };
  } catch {
    return {
      error:
        "Could not save your application. Your changes are still in the form; please try again.",
    };
  }
}

export async function deleteApplication(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Your session expired. Please log in again." };
  if (typeof id !== "string" || id.length > 80)
    return { error: "Invalid application." };
  try {
    const rows =
      await database()`DELETE FROM applications WHERE id = ${id} AND user_id = ${session.user.id} RETURNING id`;
    if (!rows.length)
      return {
        error: "This application is unavailable. Refresh and try again.",
      };
    return { success: true };
  } catch {
    return { error: "Could not delete your application. Please try again." };
  }
}
