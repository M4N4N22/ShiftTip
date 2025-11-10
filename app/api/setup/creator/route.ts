// app/api/setup/creator/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { wallet, name, token, chain } = await req.json();

    // Validate required fields
    if (!wallet || !name || !token || !chain) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { wallet },
    });

    if (existingUser) {
      // Update existing user and mark as creator (preserving donor flag)
      const updatedUser = await prisma.user.update({
        where: { wallet },
        data: {
          name,
          preferredToken: token,
          preferredChain: chain,
          isCreator: true, // ensure creator access
          // preserve donor flag as isDonor: existingUser.isDonor
        },
      });

      return NextResponse.json(
        { message: "Creator profile updated successfully", user: updatedUser },
        { status: 200 }
      );
    }

    // Create a new user as a creator
    const newUser = await prisma.user.create({
      data: {
        wallet,
        name,
        preferredToken: token,
        preferredChain: chain,
        isCreator: true,
        isDonor: false, // new creators default to not donors yet
      },
    });

    return NextResponse.json(
      { message: "Creator profile created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Creator setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
