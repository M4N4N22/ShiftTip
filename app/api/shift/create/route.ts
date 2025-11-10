import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Disable caching for live updates

export async function POST(req: Request) {
  // Generate a unique trace ID for this request
  const traceId = `shift_${Math.random().toString(36).slice(2, 10)}`;
  const log = (...args: any[]) => console.log(`[SHIFT CREATE][${traceId}]`, ...args);
  const logError = (...args: any[]) => console.error(`[SHIFT CREATE][${traceId}]`, ...args);

  try {
    const body = await req.json();
    log("Incoming request body:", body);

    const {
      depositCoin,
      depositNetwork,
      settleCoin,
      settleNetwork,
      settleAddress,  // temporary SideShift deposit address (will be returned)
      refundAddress,  // donor’s refund address
      creatorWallet,  // creator’s final receiving wallet
      donorWallet,    // donor’s connected wallet
      amount,         // donation amount
      affiliateId = process.env.SIDESHIFT_AFFILIATE_ID,
      commissionRate = "0.02",
    } = body;

    // --- Validation ---
    if (
      !depositCoin ||
      !settleCoin ||
      !depositNetwork ||
      !settleNetwork ||
      !creatorWallet ||
      !donorWallet ||
      !amount
    ) {
      logError("Missing required fields:", { depositCoin, settleCoin, depositNetwork, settleNetwork, creatorWallet, donorWallet, amount });
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // --- Prepare payload for SideShift ---
    const payload = {
      depositCoin,
      depositNetwork,
      settleCoin,
      settleNetwork,
      settleAddress: creatorWallet, // SideShift will replace this with its own
      refundAddress,
      affiliateId,
      commissionRate,
    };

    log("Sending payload to SideShift:", payload);

    const res = await fetch("https://sideshift.ai/api/v2/shifts/variable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sideshift-secret": process.env.SIDESHIFT_SECRET!,
      },
      body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    log("Raw SideShift response:", rawText);

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      logError("Invalid JSON from SideShift:", rawText);
      return NextResponse.json({ error: "Invalid JSON from SideShift" }, { status: 500 });
    }

    if (!res.ok) {
      logError("SideShift returned an error:", data);
      return NextResponse.json({ error: data }, { status: res.status });
    }

    log("SideShift success:", {
      shiftId: data.id,
      depositAddress: data.depositAddress,
      settleCoin: data.settleCoin,
      settleNetwork: data.settleNetwork,
      expiresAt: data.expiresAt,
    });

    // --- Ensure both users exist ---
    log("Ensuring donor and creator exist...");
    const [donor, creator] = await Promise.all([
      prisma.user.upsert({
        where: { wallet: donorWallet },
        update: { isDonor: true },
        create: { wallet: donorWallet, isDonor: true },
      }),
      prisma.user.upsert({
        where: { wallet: creatorWallet },
        update: { isCreator: true },
        create: { wallet: creatorWallet, isCreator: true },
      }),
    ]);

    log("Users verified:", { donorId: donor.id, creatorId: creator.id });

    // --- Save shift in DB ---
    const shift = await prisma.shift.create({
      data: {
        shiftId: data.id,
        creatorId: creator.id,
        userId: donor.id,
        amount: parseFloat(amount),
        token: depositCoin,
        network: depositNetwork,
        donorAddress: donorWallet,
        creatorAddress: creatorWallet,
        settleAddress: data.depositAddress,
        status: data.status || "waiting",
        expiresAt: data.expiresAt,
        cancellableAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    log("Shift stored in DB:", shift);

    return NextResponse.json(
      {
        message: "Shift created successfully",
        traceId,
        shift,
        sideshift: {
          id: data.id,
          depositAddress: data.depositAddress,
          settleCoin: data.settleCoin,
          settleNetwork: data.settleNetwork,
          status: data.status,
          expiresAt: data.expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(`[SHIFT CREATE][${traceId}] Server error:`, error);
    return NextResponse.json(
      { error: "Internal server error", traceId, details: error.message },
      { status: 500 }
    );
  }
}
