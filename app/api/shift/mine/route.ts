// app/api/shift/mine/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { wallet } = await req.json();
    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }

    const shifts = await prisma.shift.findMany({
      where: { donorAddress: wallet },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ shifts }, { status: 200 });
  } catch (err: any) {
    console.error("[SHIFT MINE] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
