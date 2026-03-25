import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY is missing" }, { status: 500 });
  }

  if (!process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ error: "STRIPE_PRICE_ID is missing" }, { status: 500 });
  }

  const stripe = getStripe();
  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let customerId = dbUser.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      name: dbUser.name,
      metadata: { userId: dbUser.id },
    });

    customerId = customer.id;

    await db.update(user).set({ stripeCustomerId: customerId }).where(eq(user.id, dbUser.id));
  }

  const appURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${appURL}/buy/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appURL}/buy/cancel`,
    metadata: {
      userId: dbUser.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
