import "server-only";
import { database } from "./database";
export async function membership(userId: string) {
  const rows =
    await database()`SELECT is_demo, paid FROM memberships WHERE user_id = ${userId}`;
  return {
    demo: rows[0]?.is_demo === true,
    pro: rows[0]?.is_demo === true || rows[0]?.paid === true,
  };
}
export async function reserveAI(userId: string) {
  const access = await membership(userId);
  const limit = access.pro ? 30 : 5;
  const sql = database();
  const global =
    await sql`INSERT INTO ai_usage (bucket, count) VALUES ('global', 1) ON CONFLICT (bucket, day) DO UPDATE SET count = ai_usage.count + 1 WHERE ai_usage.count < 200 RETURNING count`;
  if (!global.length)
    throw new Error("AI is at its daily capacity. Please try again tomorrow.");
  const user =
    await sql`INSERT INTO ai_usage (bucket, count) VALUES (${userId}, 1) ON CONFLICT (bucket, day) DO UPDATE SET count = ai_usage.count + 1 WHERE ai_usage.count < ${limit} RETURNING count`;
  if (!user.length) {
    await sql`UPDATE ai_usage SET count = GREATEST(0, count - 1) WHERE bucket = 'global' AND day = CURRENT_DATE`;
    throw new Error(
      `You have used your ${limit} AI requests today. Your allowance resets at midnight UTC.`,
    );
  }
}
