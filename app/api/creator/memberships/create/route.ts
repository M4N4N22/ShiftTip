import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const traceId = `mem_create_${Math.random()
    .toString(36)
    .slice(2, 10)}`;

  try {
    const body = await req.json();

    const {
      creatorWallet,
      name,
      description,
      price,
      perks,
      token,
      network,
    } = body ?? {};

    // -----------------------------
    // Validation
    // -----------------------------
    if (
      !creatorWallet ||
      !name ||
      !description ||
      !price ||
      !Array.isArray(perks) ||
      perks.length === 0 ||
      !token ||
      !network
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { error: "Invalid price" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Fetch creator
    // -----------------------------
    const creator = await prisma.user.findUnique({
      where: { wallet: creatorWallet },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // Create plan
    // -----------------------------
    const plan = await prisma.membershipPlan.create({
      data: {
        creatorId: creator.id,
        creatorWallet,
        name,
        description,
        perks,
        price: numericPrice,
        token,
        network,
        active: true,
      },
    });

    return NextResponse.json(
      {
        traceId,
        plan,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[MEMBERSHIP CREATE] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
