import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { checkoutId } = await req.json();

  if (!checkoutId) {
    return NextResponse.json(
      { error: "checkoutId required" },
      { status: 400 }
    );
  }

  const checkout = await prisma.membershipCheckout.findUnique({
    where: { checkoutId },
  });

  if (!checkout) {
    return NextResponse.json(
      { error: "Checkout not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    status: checkout.status, // pending | success | fail
  });
}
