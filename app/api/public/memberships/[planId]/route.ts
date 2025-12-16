import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { planId: string } }
) {
  const traceId = `pub_mem_${Math.random().toString(36).slice(2, 10)}`;
  const log = (...args: any[]) =>
    console.log(`[PUBLIC MEMBERSHIP][${traceId}]`, ...args);
  const logError = (...args: any[]) =>
    console.error(`[PUBLIC MEMBERSHIP][${traceId}]`, ...args);

  try {
    const { planId } = params;

    log("Incoming request for planId:", planId);

    if (!planId) {
      logError("Missing planId param");
      return NextResponse.json(
        { error: "Missing planId", traceId },
        { status: 400 }
      );
    }

    // does plan exist at all
    const rawPlan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
      select: { id: true, active: true },
    });

    log("Raw plan lookup result:", rawPlan);

    // public-facing lookup
    const plan = await prisma.membershipPlan.findFirst({
      where: {
        id: planId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        perks: true,
        price: true,
        token: true,
        network: true,
        creator: {
          select: {
            wallet: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    log("Public plan lookup result:", plan);

    if (!plan) {
      logError("Membership plan not found or not active", {
        planId,
        rawPlan,
      });

      return NextResponse.json(
        {
          error: "Membership plan not found",
          traceId,
          debug:
            process.env.NODE_ENV === "development"
              ? {
                  planId,
                  exists: !!rawPlan,
                  active: rawPlan?.active ?? null,
                }
              : undefined,
        },
        { status: 404 }
      );
    }

    log("Returning public membership plan");

    return NextResponse.json({
      ...plan,
      traceId,
    });
  } catch (err) {
    logError("Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error", traceId },
      { status: 500 }
    );
  }
}
