import { NextResponse } from "next/server";

// Cache for 1 minute to prevent spamming DefiLlama / CoinGecko
const CACHE: Record<string, { data: any; ts: number }> = {};
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawIds = searchParams.get("ids") || "";
    const symbols = searchParams.get("symbols") || "";

    // --- Build DefiLlama-compatible IDs ---
    let ids: string[] = [];
    if (rawIds) {
      ids = rawIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (symbols) {
      ids = symbols
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .map((s) => {
          const [symbol, network] = s.split("-");
          return `${normalizeChain(network)}:${normalizeSymbol(symbol)}`;
        });
    }

    if (!ids.length) {
      console.warn("[/api/prices] No ids or symbols provided");
      return NextResponse.json({});
    }

    const cacheKey = ids.sort().join(",");
    const cached = CACHE[cacheKey];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      console.log("[/api/prices] ⚡ Using cached prices");
      return NextResponse.json(cached.data);
    }

    // --- Fetch from DefiLlama ---
    const apiUrl = `https://coins.llama.fi/prices/current/${ids.join(",")}`;
    console.log("[/api/prices] Fetching from DefiLlama:", apiUrl);

    const res = await fetch(apiUrl, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`DefiLlama error: ${res.status}`);
    const data = await res.json();
    const coins = data.coins || {};

    // --- Detect missing native prices (0x000... keys) ---
    const nativeIds = ids.filter((id) =>
      id.endsWith(":0x0000000000000000000000000000000000000000")
    );
    const missingNative = nativeIds.filter((id) => !coins[id]);

    if (missingNative.length > 0) {
      const missingChains = missingNative.map((id) => id.split(":")[0]);
      console.log(
        "[/api/prices] ⚠️ Missing native chain prices, fetching from CoinGecko:",
        missingChains
      );

      // Batch CoinGecko request for all missing native chains
      const cgMap: Record<string, string> = {
        ethereum: "ethereum",
        polygon: "matic-network",
        avax: "avalanche-2",
        bsc: "binancecoin",
        optimism: "optimism",
        arbitrum: "arbitrum",
        base: "base-protocol",
        fantom: "fantom",
        solana: "solana",
      };

      const cgIds = missingChains
        .map((c) => cgMap[c])
        .filter(Boolean)
        .join(",");

      if (cgIds.length > 0) {
        const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cgIds}&vs_currencies=usd`;
        const cgRes = await fetch(cgUrl);
        const cgData = await cgRes.json();

        for (const [chain, cgId] of Object.entries(cgMap)) {
          const price = cgData[cgId]?.usd;
          if (price && missingChains.includes(chain)) {
            const key = `${chain}:0x0000000000000000000000000000000000000000`;
            coins[key] = { price };
            console.log(
              `[/api/prices] ✅ Fallback ${chain.toUpperCase()} = $${price}`
            );
          }
        }
      }
    }

    const final = { coins };
    CACHE[cacheKey] = { data: final, ts: Date.now() };

    console.log(
      "[/api/prices] ✅ Returning prices for",
      Object.keys(coins).length,
      "tokens"
    );
    return NextResponse.json(final);
  } catch (err) {
    console.error("[/api/prices] ❌ Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch token prices" },
      { status: 500 }
    );
  }
}

// --- Helpers ---

function normalizeChain(chain: string = ""): string {
  const map: Record<string, string> = {
    ethereum: "ethereum",
    eth: "ethereum",
    arbitrum: "arbitrum",
    arb: "arbitrum",
    optimism: "optimism",
    op: "optimism",
    polygon: "polygon",
    matic: "polygon",
    bsc: "bsc",
    avalanche: "avax",
    avax: "avax",
    base: "base",
    solana: "solana",
    fantom: "fantom",
  };
  return map[chain] || chain;
}

function normalizeSymbol(symbol: string = ""): string {
  return symbol;
}
