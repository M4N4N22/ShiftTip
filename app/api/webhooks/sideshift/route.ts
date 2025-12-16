import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const traceId = `ss_hook_${Math.random().toString(36).slice(2, 10)}`;
  const log = (...args: any[]) =>
    console.log(`[SIDESHIFT WEBHOOK][${traceId}]`, ...args);
  const logError = (...args: any[]) =>
    console.error(`[SIDESHIFT WEBHOOK][${traceId}]`, ...args);

  try {
    const body = await req.json();
    log("Incoming webhook:", body);

    const { payload } = body ?? {};
    const { shiftId, status } = payload ?? {};

    if (!shiftId || !status) {
      logError("Invalid webhook payload");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // SideShift checkoutId === shiftId for Pay
    const checkout = await prisma.membershipCheckout.findUnique({
      where: { checkoutId: shiftId },
    });

    if (!checkout) {
      logError("Checkout not found:", shiftId);
      return NextResponse.json({ ok: true });
    }

    // Idempotency guard
    if (checkout.status !== "pending") {
      log("Webhook already processed:", checkout.status);
      return NextResponse.json({ ok: true });
    }

    if (status === "success") {
      log("Payment successful, activating membership");

      await prisma.$transaction([
        prisma.membershipCheckout.update({
          where: { checkoutId: shiftId },
          data: { status: "success" },
        }),
        prisma.membership.create({
          data: {
            planId: checkout.planId,
            userId: checkout.userId,
          },
        }),
      ]);
    }

    if (status === "fail") {
      log("Payment failed");

      await prisma.membershipCheckout.update({
        where: { checkoutId: shiftId },
        data: { status: "fail" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("Webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
