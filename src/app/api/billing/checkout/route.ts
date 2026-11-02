import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { membership } from "@/lib/access";
import { billingReady, stripeClient, planPrice } from "@/lib/billing";
import { sameOrigin } from "@/lib/request-security";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json({ error: "Please log in." }, { status: 401 });
  if (!billingReady() || !(await planPrice()))
    return Response.json(
      { error: "Checkout is not available yet. Please try again later." },
      { status: 503 },
    );
  if ((await membership(session.user.id)).pro)
    return Response.json(
      { error: "Your account already has Pro access." },
      { status: 409 },
    );
  try {
    const sql = database();
    const stripe = stripeClient();
    await sql`INSERT INTO memberships (user_id) VALUES (${session.user.id}) ON CONFLICT DO NOTHING`;
    const [member] =
      await sql`SELECT stripe_customer_id FROM memberships WHERE user_id = ${session.user.id}`;
    let customer = member.stripe_customer_id as string | null;
    if (!customer) {
      const created = await stripe.customers.create(
        { email: session.user.email, metadata: { userId: session.user.id } },
        { idempotencyKey: `interntrack-customer-${session.user.id}` },
      );
      customer = created.id;
      await sql`UPDATE memberships SET stripe_customer_id = ${customer} WHERE user_id = ${session.user.id}`;
    }
    const origin = new URL(process.env.BETTER_AUTH_URL!).origin;
    const checkout = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        customer,
        client_reference_id: session.user.id,
        line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
        subscription_data: { metadata: { userId: session.user.id } },
        success_url: `${origin}/billing?checkout=success`,
        cancel_url: `${origin}/billing?checkout=canceled`,
      },
      {
        idempotencyKey: `interntrack-checkout-${session.user.id}-${Math.floor(Date.now() / 600000)}`,
      },
    );
    return Response.json({ url: checkout.url });
  } catch {
    return Response.json(
      { error: "Could not open checkout. Please try again." },
      { status: 503 },
    );
  }
}
