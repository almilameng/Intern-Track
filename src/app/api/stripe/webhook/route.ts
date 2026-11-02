import Stripe from "stripe";
import { stripeClient } from "@/lib/billing";
import { database } from "@/lib/database";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY)
    return new Response(null, { status: 503 });
  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      request.headers.get("stripe-signature") || "",
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }
  try {
    let subscriptionId: string | null = null;
    if (event.type === "checkout.session.completed") {
      const checkout = event.data.object as Stripe.Checkout.Session;
      if (checkout.mode === "subscription")
        subscriptionId =
          typeof checkout.subscription === "string"
            ? checkout.subscription
            : (checkout.subscription?.id ?? null);
    } else if (
      [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
      ].includes(event.type)
    ) {
      subscriptionId = (event.data.object as Stripe.Subscription).id;
    }
    if (subscriptionId) {
      // Retrieve the latest subscription instead of trusting out-of-order event snapshots.
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const customer =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
      const priceMatches = subscription.items.data.some(
        (item) => item.price.id === process.env.STRIPE_PRICE_ID,
      );
      if (!priceMatches) return Response.json({ received: true });
      const subscriptions = await stripe.subscriptions.list({
        customer,
        status: "all",
        limit: 100,
      });
      const active = subscriptions.data.find(
        (sub) =>
          ["active", "trialing"].includes(sub.status) &&
          sub.items.data.some(
            (item) => item.price.id === process.env.STRIPE_PRICE_ID,
          ),
      );
      const paid = !!active;
      await database()`UPDATE memberships SET paid = ${paid}, stripe_subscription_id = ${active?.id ?? subscription.id}, event_created = ${event.created} WHERE stripe_customer_id = ${customer} AND is_demo = false AND event_created <= ${event.created}`;
    }
    return Response.json({ received: true });
  } catch {
    return Response.json(
      { error: "Could not synchronize billing. Retry this event." },
      { status: 500 },
    );
  }
}
