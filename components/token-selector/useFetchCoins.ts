// components/token-selector/useFetchCoins.ts
import { useQuery } from "@tanstack/react-query";

export interface Coin {
  coin: string;
  name: string;
  network: string; // single network per entry
  contract?: string;
  decimals?: number;
}

// Original API coin shape
interface RawCoin {
  coin: string;
  name: string;
  networks?: string[];
  network?: string; // fallback for already flattened data
  contract?: string;
  decimals?: number;
}

async function fetchAllCoins(search = ""): Promise<Coin[]> {
  console.log("[useFetchCoins] 🚀 Fetching all coins (auto-paginate)", { search });

  const limit = 100; // reasonable batch size
  let page = 0;
  let hasMore = true;
  const all: RawCoin[] = [];

  try {
    while (hasMore) {
      const url = `/api/coins?limit=${limit}&page=${page}&q=${encodeURIComponent(search)}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`Failed to fetch page ${page}: ${res.statusText}`);

      const data = await res.json();
      if (!data || !Array.isArray(data.rows)) {
        console.error("[useFetchCoins] ❌ Invalid API response:", data);
        throw new Error("Invalid API structure");
      }

      all.push(...data.rows);
      hasMore = data.hasMore;
      page++;

      console.log(`[useFetchCoins] 📦 Loaded page ${page} (${all.length} total so far)`);

      // Optional: break after N pages for safety (avoid rate limits)
      if (page > 20) {
        console.warn("[useFetchCoins] ⚠️ Stopping after 20 pages (safety limit)");
        break;
      }
    }

    console.log(`[useFetchCoins] ✅ Finished loading ${all.length} raw coins`);

    // Flatten networks safely
    const flattened: Coin[] = all.flatMap((coin) => {
      try {
        const networks = Array.isArray(coin.networks)
          ? coin.networks
          : coin.network
          ? [coin.network]
          : [];

        if (!networks.length) {
          console.warn(`[useFetchCoins] Skipping ${coin.coin} (${coin.name}) — no networks`);
          return [];
        }

        return networks.map((n) => ({
          coin: coin.coin,
          name: coin.name,
          network: n,
          contract: coin.contract,
          decimals: coin.decimals ?? 18,
        }));
      } catch (err) {
        console.error("[useFetchCoins] ⚠️ Error flattening coin:", coin, err);
        return [];
      }
    });

    console.log(`[useFetchCoins] ✅ Flattened into ${flattened.length} network entries`);
    return flattened;
  } catch (err) {
    console.error("[useFetchCoins] ❌ Fatal error fetching all coins:", err);
    throw err;
  }
}

/**
 * React Query Hook — fetches and flattens *all* coins
 * once (no pagination in UI), then caches for 1 hour.
 */
export function useFetchCoins(search: string = "") {
  const query = useQuery({
    queryKey: ["coins", search],
    queryFn: () => fetchAllCoins(search),
    staleTime: 60 * 60 * 1000, // cache for 1h
    retry: 2,
  });

  console.log("[useFetchCoins] 🧭 Query state", {
    status: query.status,
    isFetching: query.isFetching,
    totalCoins: query.data?.length ?? 0,
  });

  if (query.error) {
    console.error("[useFetchCoins] ❌ Query error", query.error);
  }

  return {
    ...query,
    allCoins: query.data ?? [],
  };
}
