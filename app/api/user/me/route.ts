// app/api/user/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  console.log("[USER_ME] Request received");

  try {
    // -------------------------
    // Parse body
    // -------------------------
    let body;
    try {
      body = await req.json();
      console.log("[USER_ME] Parsed body:", body);
    } catch (err) {
      console.error("[USER_ME] Failed to parse JSON body", err);
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const wallet = body.wallet;
    console.log("[USER_ME] Wallet:", wallet);

    if (!wallet) {
      console.warn("[USER_ME] Missing wallet");
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 }
      );
    }

    // -------------------------
    // DB Query
    // -------------------------
    console.log("[USER_ME] Fetching user from DB");

    const user = await prisma.user.findUnique({
      where: { wallet },
      include: {
        shiftsReceived: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            shiftId: true,
            amount: true,
            token: true,
            network: true,
            status: true,
            createdAt: true,
          },
        },
        shiftsSent: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            shiftId: true,
            amount: true,
            token: true,
            network: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    console.log(
      "[USER_ME] DB result:",
      user ? "User found" : "User not found"
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // -------------------------
    // Success
    // -------------------------
    console.log("[USER_ME] Returning user data");

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
    console.error("[USER_ME] Unhandled error:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
