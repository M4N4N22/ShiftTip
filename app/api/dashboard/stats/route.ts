import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wallet } = body;

    if (!wallet) {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 }
      );
    }

    // -------------------------
    // Fetch creator
    // -------------------------
    const creator = await prisma.user.findUnique({
      where: { wallet },
      select: { id: true, isCreator: true },
    });

    if (!creator || !creator.isCreator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    const creatorId = creator.id;

    // -------------------------
    // Time ranges
    // -------------------------
    const now = new Date();

    const startOfThisMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    // -------------------------
    // Aggregate totals
    // -------------------------
    const [
      totalAgg,
      thisMonthAgg,
      lastMonthAgg,
      uniqueDonors,
      avgDonation,
      recentDonations,
    ] = await Promise.all([
      // Total donations
      prisma.shift.aggregate({
        where: {
          creatorId,
          status: "completed",
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),

      // This month
      prisma.shift.aggregate({
        where: {
          creatorId,
          status: "completed",
          completedAt: { gte: startOfThisMonth },
        },
        _sum: { amount: true },
      }),

      // Last month
      prisma.shift.aggregate({
        where: {
          creatorId,
          status: "completed",
          completedAt: {
            gte: startOfLastMonth,
            lt: startOfThisMonth,
          },
        },
        _sum: { amount: true },
      }),

      // Unique donors
      prisma.shift.findMany({
        where: {
          creatorId,
          status: "completed",
        },
        distinct: ["donorAddress"],
        select: { donorAddress: true },
      }),

      // Average donation
      prisma.shift.aggregate({
        where: {
          creatorId,
          status: "completed",
        },
        _avg: { amount: true },
      }),

      // Recent donations
      prisma.shift.findMany({
        where: {
          creatorId,
          status: "completed",
        },
        orderBy: { completedAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          token: true,
          network: true,
          completedAt: true,
          donorAddress: true,
        },
      }),
    ]);

    // -------------------------
    // Derived values
    // -------------------------
    const totalAmount = totalAgg._sum.amount ?? 0;
    const thisMonthAmount = thisMonthAgg._sum.amount ?? 0;
    const lastMonthAmount = lastMonthAgg._sum.amount ?? 0;

    const growth =
      lastMonthAmount > 0
        ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100
        : null;

    // -------------------------
    // Response
    // -------------------------
    return NextResponse.json({
      totals: {
        totalDonations: totalAmount,
        donationCount: totalAgg._count._all,
        uniqueDonors: uniqueDonors.length,
        averageDonation: avgDonation._avg.amount ?? 0,
      },
      monthly: {
        thisMonth: thisMonthAmount,
        lastMonth: lastMonthAmount,
        growthPercent: growth,
      },
      recentDonations,
    });

  } catch (error: any) {
    console.error("[DASHBOARD_STATS_ERROR]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
