import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shiftId = searchParams.get("id");

    if (!shiftId) {
      return NextResponse.json({ error: "Missing shift ID" }, { status: 400 });
    }

    const res = await fetch(`https://sideshift.ai/api/v2/shifts/${shiftId}`, {
      method: "GET",
      headers: {
        "x-sideshift-secret": process.env.SIDESHIFT_SECRET!,
      },
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Invalid JSON from SideShift:", text.slice(0, 200));
      return NextResponse.json(
        { error: "Invalid response from SideShift" },
        { status: 500 }
      );
    }

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status });
    }

    console.log(`[SHIFT API] Success: ${shiftId}`, {
      status: data.status,
      depositAddress: data.depositAddress,
      settleAmount: data.settleAmount,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[SHIFT API] Error:", err.message);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
