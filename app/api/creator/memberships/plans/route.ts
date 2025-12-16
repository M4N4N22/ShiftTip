import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const traceId = `mem_plans_${Math.random().toString(36).slice(2, 10)}`;

  try {
    const { creatorWallet } = await req.json();

    if (!creatorWallet) {
      return NextResponse.json(
        { error: "creatorWallet is required" },
        { status: 400 }
      );
    }

    // Fetch creator
    const creator = await prisma.user.findUnique({
      where: { wallet: creatorWallet },
      select: { id: true },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    // Fetch plans
    const plans = await prisma.membershipPlan.findMany({
      where: {
        creatorId: creator.id,
      },
      select: {
        id: true,
        name: true,
        price: true,
        active: true,
        memberships: {
          where: { status: "active" },
          select: { id: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Shape for UI
    const formatted = plans.map((plan) => {
      const members = plan.memberships.length;
      return {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        active: plan.active,
        members,
        monthlyRevenue: members * plan.price,
      };
    });

    return NextResponse.json({
      traceId,
      plans: formatted,
    });
  } catch (err) {
    console.error("[MEMBERSHIP PLANS] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
