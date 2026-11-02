import "server-only";
import Stripe from "stripe";
export function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY)
    throw new Error("Billing is not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    maxNetworkRetries: 1,
    timeout: 20000,
  });
}
export function billingReady() {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PRICE_ID &&
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
export async function planPrice() {
  if (!billingReady()) return null;
  try {
    const price = await stripeClient().prices.retrieve(
      process.env.STRIPE_PRICE_ID!,
    );
    if (
      !price.active ||
      price.type !== "recurring" ||
      !price.recurring ||
      price.unit_amount === null
    )
      return null;
    return {
      label: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: price.currency,
      }).format(price.unit_amount / 100),
      interval: price.recurring.interval,
      intervalCount: price.recurring.interval_count,
    };
  } catch {
    return null;
  }
}
