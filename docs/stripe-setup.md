# Activate Stripe checkout

The app is wired for a recurring Pro subscription. A suggested starting price is $5/month; choose the amount you want before creating the Stripe Price. The app reads and displays the configured price automatically.

1. Create a Stripe account and complete the business, identity, bank, and live-payment activation steps Stripe requires. These are completed by the account owner.
2. In the Stripe product catalog, create **InternTrack Pro** with a recurring monthly price. Copy its Price ID (price_...).
3. Add these variables to the InternTrack Vercel project for Production: **STRIPE_SECRET_KEY** (Secret), **STRIPE_PRICE_ID** (Config), and **STRIPE_WEBHOOK_SECRET** (Secret). Never commit key values or send them in chat. Keep test keys/prices/webhooks together during testing; use live equivalents to accept money.
4. Create a **snapshot** webhook event destination for your account at **https://intern-track-inky.vercel.app/api/stripe/webhook**. Select **checkout.session.completed**, **customer.subscription.created**, **customer.subscription.updated**, and **customer.subscription.deleted**. Copy the endpoint signing secret (whsec_...) into STRIPE_WEBHOOK_SECRET.
5. Activate the Stripe customer portal with subscription cancellation enabled. InternTrack uses it for the Manage subscription button.
6. Redeploy after all three environment variables are saved. Open /billing, check the displayed price, and test the full checkout in Stripe test mode, including the webhook granting Pro and cancellation removing access at the end of the subscription.
7. Switch to live credentials, live Price ID, and live webhook secret to accept real payments. The assignment's live $1 payment is a separate Week 4 verification; do not charge a real card during setup without the owner's instruction.

Checkout success URLs never grant access. Only signed Stripe events and the server-owned demo entitlement can enable Pro. The endpoint re-reads current subscription state to reduce out-of-order event issues. Until valid payment settings are present, checkout remains disabled.

Sources: https://docs.stripe.com/checkout/quickstart and https://docs.stripe.com/webhooks
