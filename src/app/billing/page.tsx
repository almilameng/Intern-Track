import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Brand from "@/components/brand";
import BillingButton from "@/components/billing-button";
import { auth } from "@/lib/auth";
import { membership } from "@/lib/access";
import { planPrice } from "@/lib/billing";
export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const [access, price, query] = await Promise.all([
    membership(session.user.id),
    planPrice(),
    searchParams,
  ]);
  return (
    <div className="feature-page">
      <header className="feature-header">
        <Brand />
        <nav>
          <Link href="/dashboard">Tracker</Link>
          <Link href="/matches">Resume & matches</Link>
        </nav>
      </header>
      <main className="feature-main">
        <span className="section-kicker">INVEST IN YOUR NEXT STEP</span>
        <h1>Your InternTrack plan</h1>
        {query.checkout === "success" && (
          <p className="info-banner">
            Thanks for checking out. Access updates after Stripe confirms your
            subscription. If your plan still shows Free, refresh this page in a
            moment.
          </p>
        )}
        {query.checkout === "canceled" && (
          <p className="info-banner">
            Checkout canceled. Your current plan is unchanged.
          </p>
        )}
        <p>
          You currently have <strong>{access.pro ? "Pro" : "Free"}</strong>{" "}
          access{access.demo ? " through the shared demo account" : ""}.
        </p>
        <div className="plan-grid">
          <section className="feature-card">
            <h2>Free</h2>
            <div className="price">$0</div>
            <ul>
              <li>Application tracker and deadlines</li>
              <li>Interview dates with time zones</li>
              <li>5 AI requests per day</li>
              <li>Saved resume profile and match results</li>
            </ul>
            <Link className="button secondary" href="/dashboard">
              Go to tracker
            </Link>
          </section>
          <section className="feature-card">
            <h2>Pro</h2>
            {price ? (
              <div className="price">
                {price.label}
                <small>
                  {" "}
                  / {price.intervalCount > 1 ? `${price.intervalCount} ` : ""}
                  {price.interval}
                </small>
              </div>
            ) : (
              <p>Paid plan opens soon.</p>
            )}
            <ul>
              <li>Everything in Free</li>
              <li>30 AI requests per day</li>
              <li>Compare more opportunities as your search grows</li>
              <li>Manage or cancel your subscription through Stripe</li>
            </ul>
            {access.demo ? (
              <p>Demo access is already included. No payment needed.</p>
            ) : access.pro ? (
              <BillingButton portal />
            ) : (
              <BillingButton disabled={!price} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
