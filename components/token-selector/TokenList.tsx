"use client";

import { useEffect, useMemo, useState } from "react";
import { TokenRow } from "./TokenRow";
import { Loader2 } from "lucide-react";

interface TokenListProps {
  coins: any[];
  selectedCoin: string | null;
  onSelect: (coin: string, network: string, balance: number, usdValue: number) => void;
  showOnlyNonzero?: boolean;
}

export function TokenList({
  coins,
  selectedCoin,
  onSelect,
  showOnlyNonzero = true,
}: TokenListProps) {
  const [containerHeight, setContainerHeight] = useState<number>(400);
  const [isLoading, setIsLoading] = useState(true);

  // Handle resize for responsive container height
  useEffect(() => {
    const handleResize = () => {
      const viewportHeight = window.innerHeight;
      const maxListHeight = Math.max(200, viewportHeight * 0.6);
      setContainerHeight(maxListHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Graceful load state
  useEffect(() => {
    if (coins && coins.length > 0) {
      // Add a small delay to smooth the transition
      const timeout = setTimeout(() => setIsLoading(false), 250);
      return () => clearTimeout(timeout);
    }
  }, [coins]);

  const visibleCoins = useMemo(() => {
    return showOnlyNonzero
      ? coins.filter((c) => c.balance && c.balance > 0)
      : coins;
  }, [coins, showOnlyNonzero]);

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="text-white/70 text-sm text-center py-8 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-white/60" />
        Loading tokens...
      </div>
    );
  }

  // --- Empty state ---
  if (!visibleCoins.length) {
    return (
      <div className="text-white/60 text-sm text-center py-8">
        No tokens with balance found.
      </div>
    );
  }

  // --- Render token list ---
  return (
    <div
      className="overflow-y-auto transition-all duration-300 ease-in-out"
      style={{ maxHeight: containerHeight }}
    >
      <div className="flex flex-col space-y-1">
        {visibleCoins.map((coin, index) => (
          <TokenRow
            key={`${coin.coin}-${coin.network}-${index}`}
            coin={coin.coin}
            name={coin.name}
            network={coin.network}
            balance={coin.balance ?? 0}
            usdValue={coin.usdValue ?? 0}
            selected={selectedCoin === `${coin.coin}-${coin.network}`}
            onClick={() =>
              onSelect(
                `${coin.coin}-${coin.network}`,
                coin.network,
                coin.balance ?? 0,
                coin.usdValue ?? 0
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
