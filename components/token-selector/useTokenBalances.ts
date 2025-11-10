"use client";

import { useEffect, useState, useMemo } from "react";
import { formatUnits, Abi, createPublicClient, http, type Chain } from "viem";
import {
  mainnet,
  polygon,
  bsc,
  arbitrum,
  optimism,
  base,
  avalanche,
} from "viem/chains";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";

export interface TokenWithBalance {
  coin: string;
  name: string;
  network: string;
  contract?: string;
  decimals?: number;
  balance?: number;
  usdValue?: number;
}

// --- Supported chains map ---
const CHAIN_MAP = {
  ethereum: mainnet,
  polygon,
  bsc,
  arbitrum,
  optimism,
  base,
  avax: avalanche,
} as const satisfies Record<string, Chain>;

type ChainKey = keyof typeof CHAIN_MAP;

// ✅ Narrowing helper
function isSupportedChain(x: string): x is ChainKey {
  return x in CHAIN_MAP;
}

async function fetchTokenPrices(
  allCoins: TokenWithBalance[],
  balances: Record<string, number>
) {
  const nonZero = allCoins.filter((c) => {
    const key = `${c.coin.toLowerCase()}-${c.network.toLowerCase()}`;
    return balances[key] && balances[key] > 0;
  });
  if (!nonZero.length) return {};

  const ids = nonZero.map((c) => {
    const chain = normalizeChain(c.network.toLowerCase());
    const nativeMap: Record<string, string> = {
      eth: "ethereum",
      matic: "polygon",
      avax: "avax",
      bnb: "bsc",
      op: "optimism",
      arb: "arbitrum",
      base: "base",
      ftm: "fantom",
      sol: "solana",
    };
    const coin = c.coin.toLowerCase();
    if (!c.contract && nativeMap[coin]) {
      return `${nativeMap[coin]}:0x0000000000000000000000000000000000000000`;
    }
    return c.contract ? `${chain}:${c.contract}` : `${chain}:${coin}`;
  });

  const res = await fetch(`/api/prices?ids=${ids.join(",")}`);
  if (!res.ok) throw new Error("Failed to fetch prices");
  const data = await res.json();

  const prices: Record<string, number> = {};
  for (const [id, val] of Object.entries<any>(data.coins || {})) {
    const [chain, address] = id.split(":");
    const match = nonZero.find((c) => {
      const isSameChain = normalizeChain(c.network) === chain;
      const isNative =
        !c.contract &&
        (address === "0x0000000000000000000000000000000000000000" ||
          address === undefined);
      const isSameContract =
        c.contract?.toLowerCase() === address?.toLowerCase();
      return isSameChain && (isSameContract || isNative);
    });
    if (match) {
      prices[match.coin.toLowerCase()] = val.price ?? 0;
    }
  }

  console.log("[useTokenBalances] ✅ Prices fetched:", prices);
  return prices;
}

export function useTokenBalances(allCoins: TokenWithBalance[]) {
  const { address } = useAccount();
  const [balances, setBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchBalances = async () => {
      if (!address || allCoins.length === 0) return;

      console.log("[useTokenBalances] 🌐 Starting multi-chain balance fetch");

      const ERC20_ABI: Abi = [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "owner", type: "address" }],
          outputs: [{ name: "balance", type: "uint256" }],
        },
      ];

      const updated: Record<string, number> = {};

      const uniqueChains = [
        ...new Set(
          allCoins.map((c) => normalizeChain(c.network.toLowerCase()))
        ),
      ];

      // === Fetch each chain in parallel ===
      await Promise.all(
        uniqueChains.map(async (networkStr) => {
          const network = networkStr.toLowerCase();

          if (!isSupportedChain(network)) {
            console.warn(
              "[useTokenBalances] Skipping unsupported chain:",
              network
            );
            return;
          }

          const chainInfo = CHAIN_MAP[network]; // ✅ fully typed, no error

          const client = createPublicClient({
            chain: chainInfo,
            transport: http(),
          });

          const networkCoins = allCoins.filter(
            (c) => normalizeChain(c.network) === network
          );

          const erc20s = networkCoins
            .filter((c) => c.contract)
            .map((c) => ({
              abi: ERC20_ABI,
              address: c.contract as `0x${string}`,
              functionName: "balanceOf" as const,
              args: [address as `0x${string}`],
            }));

          try {
            // ✅ Build calls *with token reference*
            const erc20Calls = networkCoins
              .filter((c) => c.contract)
              .map((c) => ({
                token: c, // keep reference for mapping
                call: {
                  abi: ERC20_ABI,
                  address: c.contract as `0x${string}`,
                  functionName: "balanceOf" as const,
                  args: [address as `0x${string}`],
                },
              }));

            // === Execute multicall for all ERC20s ===
            if (erc20Calls.length > 0) {
              const results = await client.multicall({
                contracts: erc20Calls.map((x) => x.call),
              });

              results.forEach((res, i) => {
                const coin = erc20Calls[i].token; // ✅ perfectly aligned
                const decimals = coin.decimals ?? 18;
                const key = `${coin.coin.toLowerCase()}-${coin.network.toLowerCase()}`;

                const value =
                  res.status === "success"
                    ? parseFloat(formatUnits(res.result as bigint, decimals))
                    : 0;

                if (value > 0) updated[key] = value;
              });
            }

            // === Native token ===
            const native = networkCoins.find((c) => !c.contract);
            if (native) {
              const bal = await client.getBalance({ address });
              const formatted = parseFloat(
                formatUnits(bal, native.decimals ?? 18)
              );
              if (formatted > 0) {
                const nativeKey = `${native.coin.toLowerCase()}-${network}`;
                updated[nativeKey] = formatted;
              }
            }
          } catch (err) {
            console.warn(
              `[useTokenBalances] ⚠️ Error fetching ${network}`,
              err
            );
          }
        })
      );

      console.log("[useTokenBalances] ✅ Final multi-chain balances:", updated);
      setBalances(updated);
    };

    fetchBalances();
  }, [address, allCoins]);

  const { data: prices = {} } = useQuery({
    queryKey: ["prices", JSON.stringify(balances)],
    queryFn: () => fetchTokenPrices(allCoins, balances),
    enabled: Object.keys(balances).length > 0,
    staleTime: 60 * 1000,
  });

  const nonZeroCoins = useMemo(() => {
    const combined = allCoins
      .map((coin) => {
        const key = `${coin.coin.toLowerCase()}-${coin.network.toLowerCase()}`;
        const balance = balances[key];
        if (!balance || balance <= 0) return null;
        const usd = prices[coin.coin.toLowerCase()] ?? 0;
        return {
          ...coin,
          balance,
          usdValue: balance * usd,
        };
      })
      .filter(Boolean) as TokenWithBalance[];

    return combined.sort((a, b) => (b.usdValue ?? 0) - (a.usdValue ?? 0));
  }, [allCoins, balances, prices]);

  return { tokens: nonZeroCoins, balances, prices };
}

// --- Helper ---
function normalizeChain(chain: string) {
  const map: Record<string, string> = {
    eth: "ethereum",
    ethereum: "ethereum",
    arb: "arbitrum",
    arbitrum: "arbitrum",
    op: "optimism",
    optimism: "optimism",
    polygon: "polygon",
    matic: "polygon",
    bsc: "bsc",
    avax: "avax",
    avalanche: "avax",
    base: "base",
    solana: "solana",
  };
  return map[chain] || chain;
}
