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
    // Fetch completed shifts
    // -------------------------
    const shifts = await prisma.shift.findMany({
      where: {
        creatorId,
        status: "completed",
      },
      select: {
        donorAddress: true,
        amount: true,
        completedAt: true,
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    // -------------------------
    // Aggregate by supporter
    // -------------------------
    const supporterMap = new Map<
      string,
      {
        address: string;
        totalAmount: number;
        donationCount: number;
        lastDonationAt: Date;
      }
    >();

    for (const shift of shifts) {
      const key = shift.donorAddress;

      if (!supporterMap.has(key)) {
        supporterMap.set(key, {
          address: key,
          totalAmount: 0,
          donationCount: 0,
          lastDonationAt: shift.completedAt!,
        });
      }

      const supporter = supporterMap.get(key)!;
      supporter.totalAmount += shift.amount;
      supporter.donationCount += 1;

      if (shift.completedAt! > supporter.lastDonationAt) {
        supporter.lastDonationAt = shift.completedAt!;
      }
    }

    const supporters = Array.from(supporterMap.values());

    // -------------------------
    // Derived lists
    // -------------------------
    const topSupporters = [...supporters]
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    const recentSupporters = [...supporters]
      .sort(
        (a, b) =>
          b.lastDonationAt.getTime() - a.lastDonationAt.getTime()
      )
      .slice(0, 10);

    // -------------------------
    // Response
    // -------------------------
    return NextResponse.json({
      totalSupporters: supporters.length,
      topSupporters: topSupporters.map((s) => ({
        address: s.address,
        totalAmount: s.totalAmount,
        donationCount: s.donationCount,
        lastDonationAt: s.lastDonationAt.toISOString(),
      })),
      recentSupporters: recentSupporters.map((s) => ({
        address: s.address,
        lastDonationAt: s.lastDonationAt.toISOString(),
      })),
    });

  } catch (error: any) {
    console.error("[COMMUNITY_API_ERROR]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
