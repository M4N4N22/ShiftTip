"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useFetchCoins } from "./useFetchCoins";
import { useTokenBalances } from "./useTokenBalances";
import { TokenList } from "./TokenList";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";

interface TokenChainSelectorProps {
  onSelect: (
    coin: string,
    network: string,
    balance: number,
    usdValue: number
  ) => void;
}

export default function TokenChainSelector({
  onSelect,
}: TokenChainSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  const { isConnected, address, isConnecting } = useAccount();
  const { allCoins, isLoading, isFetching } = useFetchCoins(search);
  const { tokens } = useTokenBalances(allCoins);

  const filteredTokens = useMemo(() => {
    if (!search.trim()) return tokens;
    const q = search.toLowerCase();
    return tokens.filter(
      (t) =>
        t.coin.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.network.toLowerCase().includes(q)
    );
  }, [search, tokens]);

  const showLoadingState = isLoading && tokens.length === 0;
  const showUpdatingState = isFetching && !showLoadingState;
  const showEmptyState =
    !isLoading &&
    !isFetching &&
    filteredTokens.length === 0 &&
    search.trim().length > 0;

  const shortAddress = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <div className="space-y-6 relative min-h-[200px] flex flex-col justify-center">
      {/* Wallet Connection / Info */}
      {!isConnected || isConnecting ? (
        <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
          {isConnecting ? (
            <p className="text-white/70 text-sm animate-pulse">
              Connecting wallet...
            </p>
          ) : (
            <>
              <p className="text-white/70 text-sm">
                Please connect your wallet to view your available tokens.
              </p>
              <ConnectKitButton />
            </>
          )}
        </div>
      ) : (
        <>
          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Search token or chain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10"
            />
            {showUpdatingState && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-xs animate-pulse">
                Updating...
              </span>
            )}
          </div>

          {/* Token List States */}
          {showLoadingState ? (
            <p className="text-white/70 text-sm text-center py-4 animate-pulse">
              Detecting supported tokens in your wallet...
            </p>
          ) : showEmptyState ? (
            <div className="text-white/60 text-sm text-center py-6">
              No tokens found matching "{search}".
            </div>
          ) : (
            <>
              {showUpdatingState && (
                <p className="text-white/50 text-xs text-center animate-pulse mb-2">
                  Fetching latest token data...
                </p>
              )}
              <TokenList
                coins={filteredTokens}
                selectedCoin={selectedCoin}
                onSelect={(coinKey, network, balance, usdValue) => {
                  setSelectedCoin(coinKey);
                  onSelect(coinKey.split("-")[0], network, balance, usdValue);
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
