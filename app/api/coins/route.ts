import { NextResponse } from "next/server";

const EVM_NETWORKS = ["ethereum", "polygon", "base", "bsc", "optimism", "arbitrum"];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? 20);
    const page = Number(searchParams.get("page") ?? 0);
    const q = searchParams.get("q")?.toLowerCase() ?? "";

    // Fetch from SideShift
    const res = await fetch("https://sideshift.ai/api/v2/coins", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Failed to fetch coins: ${res.status}`);
    const allCoins: any[] = await res.json();

    // Defensive flatten
    const flattened = allCoins.flatMap((coin) => {
      const networks: string[] = Array.isArray(coin.networks) ? coin.networks : [];
      const tokenDetails = typeof coin.tokenDetails === "object" ? coin.tokenDetails : {};

      if (!networks.length) return [];

      return networks
        .filter((n) => EVM_NETWORKS.includes(n.toLowerCase()))
        .map((network: string) => {
          const details = tokenDetails?.[network] ?? {};
          return {
            coin: coin.coin ?? "",
            name: coin.name ?? "",
            network,
            contract: details.contractAddress ?? null,
            decimals: details.decimals ?? 18,
            hasMemo: !!coin.hasMemo,
          };
        });
    });

    // Search filter
    const filtered = q
      ? flattened.filter(
          (c) =>
            c.coin.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            c.network.toLowerCase().includes(q)
        )
      : flattened;

    // Pagination
    const start = page * limit;
    const end = start + limit;
    const rows = filtered.slice(start, end);
    const hasMore = end < filtered.length;

    console.log(`[api/coins] returning ${rows.length} tokens (EVM filtered)`);

    return NextResponse.json({ rows, hasMore });
  } catch (error) {
    console.error("[api/coins] Error fetching coins:", error);
    return NextResponse.json(
      { error: "Failed to fetch coins" },
      { status: 500 }
    );
  }
}
