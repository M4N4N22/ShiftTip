// app/api/user/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // always fetch fresh data

export async function POST(req: Request) {
  try {
    const { wallet } = await req.json();

    if (!wallet) {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { wallet },
      include: {
        shiftsReceived: {
          select: {
            id: true,
            shiftId: true,
            amount: true,
            token: true,
            network: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        shiftsSent: {
          select: {
            id: true,
            shiftId: true,
            amount: true,
            token: true,
            network: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      wallet: user.wallet,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      isCreator: user.isCreator,
      isDonor: user.isDonor,
      preferredToken: user.preferredToken,
      preferredChain: user.preferredChain,
      createdAt: user.createdAt,
      shiftsReceived: user.shiftsReceived,
      shiftsSent: user.shiftsSent,
    });
  } catch (error: any) {
    console.error("[USER_ME] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
