import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { stripeClient } from "@/lib/billing";
import { sameOrigin } from "@/lib/request-security";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response(null, { status: 401 });
  try {
    const [member] =
      await database()`SELECT stripe_customer_id FROM memberships WHERE user_id = ${session.user.id} AND is_demo = false`;
    if (!member?.stripe_customer_id)
      return Response.json(
        { error: "No billing account is linked yet." },
        { status: 400 },
      );
    const portal = await stripeClient().billingPortal.sessions.create({
      customer: member.stripe_customer_id,
      return_url: `${new URL(process.env.BETTER_AUTH_URL!).origin}/billing`,
    });
    return Response.json({ url: portal.url });
  } catch {
    return Response.json(
      { error: "Billing management is temporarily unavailable." },
      { status: 503 },
    );
  }
}
