// File: app/api/shift/cancel/route.ts
import { NextResponse } from "next/server";

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

    console.log(`[SHIFT CANCEL] Attempting to cancel order: ${orderId}`);

    const res = await fetch("https://sideshift.ai/api/v2/cancel-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sideshift-secret": process.env.SIDESHIFT_SECRET!, // keep secure
      },
      body: JSON.stringify({ orderId }),
    });

    if (res.status === 204) {
      console.log(`[SHIFT CANCEL] Order ${orderId} cancelled successfully`);
      return NextResponse.json({ success: true });
    }

    const rawText = await res.text();
    let data: any;

    try {
      data = JSON.parse(rawText);
    } catch {
      data = { error: rawText };
    }

    console.error("[SHIFT CANCEL] Failed to cancel order:", data);
    return NextResponse.json(
      { error: data?.error?.message || "Failed to cancel order" },
      { status: res.status }
    );
  } catch (error: any) {
    console.error("[SHIFT CANCEL] Server error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
