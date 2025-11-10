import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // ensures no caching

export async function GET(req: Request) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const amount = searchParams.get("amount") || "500";
    const affiliateId = searchParams.get("affiliateId") || process.env.SIDESHIFT_AFFILIATE_ID;
    const commissionRate = searchParams.get("commissionRate") || "0.02";

    // Log incoming query
    console.log("[PAIR API] Request received", {
      from,
      to,
      amount,
      affiliateId,
      commissionRate,
      timestamp: new Date().toISOString(),
    });

    if (!from || !to) {
      console.warn("[PAIR API] Missing required query params", { from, to });
      return NextResponse.json(
        { error: "Missing required query params: from, to" },
        { status: 400 }
      );
    }

    const url = `https://sideshift.ai/api/v2/pair/${from}/${to}?affiliateId=${affiliateId}&amount=${amount}&commissionRate=${commissionRate}`;

    console.log("[PAIR API] Fetching SideShift endpoint", { url });

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-sideshift-secret": process.env.SIDESHIFT_SECRET!,
      },
    });

    const rawText = await res.text();

    // Log raw status
    console.log("[PAIR API] SideShift response status", {
      status: res.status,
      ok: res.ok,
      timeTakenMs: Date.now() - startTime,
    });

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("[PAIR API] Invalid JSON from SideShift", {
        snippet: rawText.slice(0, 300),
      });
      return NextResponse.json(
        { error: "Invalid JSON response from SideShift" },
        { status: 500 }
      );
    }

    if (!res.ok) {
      console.error("[PAIR API] SideShift returned error", { status: res.status, data });
      return NextResponse.json(
        { error: "SideShift API Error", details: data },
        { status: res.status }
      );
    }

    console.log("[PAIR API] Success", {
      pair: `${from} → ${to}`,
      rate: data.rate,
      min: data.min,
      max: data.max,
      timeTakenMs: Date.now() - startTime,
    });

    return NextResponse.json({
      min: data.min,
      max: data.max,
      rate: data.rate,
      depositCoin: data.depositCoin,
      settleCoin: data.settleCoin,
      depositNetwork: data.depositNetwork,
      settleNetwork: data.settleNetwork,
    });
  } catch (error: any) {
    console.error("[PAIR API] Unhandled error", {
      message: error.message,
      stack: error.stack,
      timeTakenMs: Date.now() - startTime,
    });
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
