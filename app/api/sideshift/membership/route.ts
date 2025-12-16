import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIp } from "@/lib/getUserIp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const traceId = `ss_mem_${Math.random().toString(36).slice(2, 10)}`;
  const log = (...args: any[]) =>
    console.log(`[SIDESHIFT MEMBERSHIP][${traceId}]`, ...args);
  const logError = (...args: any[]) =>
    console.error(`[SIDESHIFT MEMBERSHIP][${traceId}]`, ...args);

  const userIp = getUserIp(req);
  log("Resolved user IP:", userIp);

  try {
    const body = await req.json();
    log("Incoming body:", body);

    const {
      planId,
      settleCoin,
      settleNetwork,
      price, // string
      subscriberWallet,
    } = body ?? {};

    // -----------------------------
    // Validation
    // -----------------------------
    if (
      !planId ||
      !settleCoin ||
      !settleNetwork ||
      !price ||
      !subscriberWallet
    ) {
      logError("Missing required fields", {
        planId,
        settleCoin,
        settleNetwork,
        price,
        subscriberWallet,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Fetch membership plan
    // -----------------------------
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      logError("Plan not found:", planId);
      return NextResponse.json(
        { error: "Membership plan not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // Server-owned config
    // -----------------------------
    const affiliateId = process.env.SIDESHIFT_AFFILIATE_ID!;
    const secret = process.env.SIDESHIFT_SECRET!;
    const settleAddress = plan.creatorWallet;

    if (!affiliateId || !secret || !settleAddress) {
      throw new Error("SideShift env vars not configured");
    }

    // ✅ Deterministic app URL (no env needed)
    const isDev = process.env.NODE_ENV !== "production";
    const appUrl = isDev
      ? "http://localhost:3000"
      : "https://shift-tip.vercel.app";

    const successUrl = `${appUrl}/membership/success`;
    const cancelUrl = `${appUrl}/membership/cancel`;

    // -----------------------------
    // Create SideShift checkout
    // -----------------------------
    const payload = {
      settleCoin,
      settleNetwork: settleNetwork.toLowerCase(),
      settleAmount: price,
      settleAddress,
      affiliateId,
      successUrl,
      cancelUrl,
    };

    log("Creating SideShift checkout:", payload);

    const res = await fetch("https://sideshift.ai/api/v2/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-sideshift-secret": secret,
        "x-user-ip": userIp,
      },
      body: JSON.stringify(payload),
    });

    const raw = await res.text();
    log("Raw SideShift response:", raw);

    let checkout: any;
    try {
      checkout = JSON.parse(raw);
    } catch {
      logError("Invalid JSON from SideShift:", raw);
      return NextResponse.json(
        { error: "Invalid response from SideShift" },
        { status: 500 }
      );
    }

    if (!res.ok) {
      logError("SideShift error:", checkout);
      return NextResponse.json(
        { error: checkout },
        { status: res.status }
      );
    }

    // -----------------------------
    // Ensure subscriber exists
    // -----------------------------
    const subscriber = await prisma.user.upsert({
      where: { wallet: subscriberWallet },
      update: {},
      create: { wallet: subscriberWallet },
    });

    // -----------------------------
    // Persist checkout
    // -----------------------------
    const membershipCheckout = await prisma.membershipCheckout.create({
      data: {
        checkoutId: checkout.id,
        planId: plan.id,
        userId: subscriber.id,
        amount: parseFloat(price),
        token: settleCoin,
        network: settleNetwork,
        status: "pending",
      },
    });

    log("Membership checkout stored:", membershipCheckout.id);

    return NextResponse.json(
      {
        traceId,
        checkoutId: checkout.id,
        redirectUrl: `https://pay.sideshift.ai/checkout/${checkout.id}`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    logError("Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error", traceId },
      { status: 500 }
    );
  }
}
