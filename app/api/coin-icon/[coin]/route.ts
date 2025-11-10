import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { coin: string } }
) {
  const coinId = params.coin;
  const sideshiftUrl = `https://sideshift.ai/api/v2/coins/icon/${coinId}`;

  try {
    console.log("[/api/coin-icon] Fetching:", sideshiftUrl);
    const res = await fetch(sideshiftUrl, { headers: { Accept: "image/svg" } });
    const type = res.headers.get("content-type") || "";

    if (!res.ok) {
      console.warn("[/api/coin-icon] ❌ Not OK:", res.status, type);
      throw new Error("Bad status from Sideshift");
    }

    // ✅ if it's SVG (text-based), send text directly
    if (type.includes("svg")) {
      const svgText = await res.text();
      if (!svgText.startsWith("<svg")) {
        console.warn("[/api/coin-icon] ⚠️ Invalid SVG text:", svgText.slice(0, 100));
        throw new Error("Invalid SVG");
      }
      console.log("[/api/coin-icon] ✅ Returning inline SVG for", coinId);
      return new NextResponse(svgText, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }

    // ✅ else assume PNG or other binary
    const blob = await res.blob();
    console.log("[/api/coin-icon] ✅ Returning binary image for", coinId, "size", blob.size);
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Length": blob.size.toString(),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    console.error("[/api/coin-icon] ❌ Error:", err);

    // simple gray placeholder
    const fallback = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <rect width="64" height="64" fill="#222"/>
      <text x="32" y="38" text-anchor="middle" fill="#999" font-size="18">${coinId.slice(0,2).toUpperCase()}</text>
    </svg>`;
    return new NextResponse(fallback, {
      status: 200,
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}
