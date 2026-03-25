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

  const stripe = getStripe();
  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);

  if (!dbUser || !dbUser.stripeCustomerId) {
    return NextResponse.json({ error: "No active subscription found." }, { status: 404 });
  }

  const appURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${appURL}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
