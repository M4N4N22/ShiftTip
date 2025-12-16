import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const traceId = `mem_stats_${Math.random().toString(36).slice(2, 10)}`;

  try {
    const { creatorWallet } = await req.json();

    if (!creatorWallet) {
      return NextResponse.json(
        { error: "creatorWallet is required" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Fetch creator
    // -----------------------------
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

    // -----------------------------
    // Active members
    // -----------------------------
    const activeMemberships = await prisma.membership.findMany({
      where: {
        status: "active",
        plan: {
          creatorId: creator.id,
        },
      },
      select: {
        plan: {
          select: { price: true },
        },
      },
    });

    const activeMembers = activeMemberships.length;

    const monthlyRevenue = activeMemberships.reduce(
      (sum, m) => sum + m.plan.price,
      0
    );

    // -----------------------------
    // Total earned (historical)
    // -----------------------------
    const totalEarnedAgg = await prisma.membershipCheckout.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "success",
        plan: {
          creatorId: creator.id,
        },
      },
    });

    return NextResponse.json({
      traceId,
      activeMembers,
      monthlyRevenue,
      totalEarned: totalEarnedAgg._sum.amount ?? 0,
    });
  } catch (err) {
    console.error("[MEMBERSHIP STATS] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
