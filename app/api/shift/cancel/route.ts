// app/api/shift/cancel/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId in request body" },
        { status: 400 }
      );
    }

    console.log(`[SHIFT CANCEL][${orderId}] Attempting cancellation...`);

    // --- Step 1: Cancel via SideShift API ---
    const res = await fetch("https://sideshift.ai/api/v2/cancel-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sideshift-secret": process.env.SIDESHIFT_SECRET!,
      },
      body: JSON.stringify({ orderId }),
    });

    if (res.status === 204) {
      console.log(`[SHIFT CANCEL][${orderId}] SideShift confirmed cancellation (204)`);

      // --- Step 2: Update DB ---
      const updatedShift = await prisma.shift.updateMany({
        where: { shiftId: orderId },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          updatedAt: new Date(),
        },
      });

      if (updatedShift.count === 0) {
        console.warn(`[SHIFT CANCEL][${orderId}] No matching shift found in DB.`);
      } else {
        console.log(
          `[SHIFT CANCEL][${orderId}] Shift record updated in DB:`,
          updatedShift
        );
      }

      return NextResponse.json({
        success: true,
        message: "Shift cancelled successfully",
        shiftId: orderId,
      });
    }

    // --- Step 3: Handle API error ---
    const rawText = await res.text();
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { error: rawText };
    }

    console.error(`[SHIFT CANCEL][${orderId}] SideShift API error:`, data);

    return NextResponse.json(
      {
        error: data?.error?.message || "Failed to cancel order",
        details: data,
      },
      { status: res.status }
    );
  } catch (error: any) {
    console.error(`[SHIFT CANCEL] Server error for ${req.url}:`, error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
