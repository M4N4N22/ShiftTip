"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

interface AmountInputProps {
  amount: string;
  setAmount: (value: string) => void;
  selectedToken?: string;
  selectedChain?: string;
  tokenUsdPrice?: number;
  tokenBalance?: number;
}

function formatTokenBalance(balance: number | undefined): string {
  if (balance === undefined || isNaN(balance)) return "0.00";
  if (balance === 0) return "0.00";
  if (balance < 0.0001) return balance.toFixed(8).replace(/\.?0+$/, "");
  if (balance < 1) return balance.toFixed(4).replace(/\.?0+$/, "");
  return balance.toFixed(2).replace(/\.?0+$/, "");
}

export function AmountInput({
  amount,
  setAmount,
  selectedToken,
  selectedChain,
  tokenUsdPrice = 0,
  tokenBalance = 0,
}: AmountInputProps) {
  const [error, setError] = useState<string | null>(null);

  const numericAmount = useMemo(() => parseFloat(amount || "0"), [amount]);

  const usdEquivalent = useMemo(() => {
    return numericAmount && tokenUsdPrice ? numericAmount * tokenUsdPrice : 0;
  }, [numericAmount, tokenUsdPrice]);

  useEffect(() => {
    // Reset error on clear
    if (!amount) {
      setError(null);
      return;
    }

    // Not a number
    if (isNaN(numericAmount)) {
      setError("Only numbers allowed");
      return;
    }

    // Must be positive
    if (numericAmount <= 0) {
      setError("Enter a valid positive amount");
      return;
    }

    // Must be worth at least $1
    if (usdEquivalent < 1) {
      setError("Minimum amount must be at least $1");
      return;
    }

    // Must not exceed balance
    if (tokenBalance && numericAmount > tokenBalance) {
      setError("Amount exceeds available balance");
      return;
    }

    setError(null);
  }, [amount, numericAmount, usdEquivalent, tokenBalance]);

  return (
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between">
        <Label>Amount</Label>
      </div>

      {/* Input with token icon */}
      <div className="relative">
        <div className="flex items-center gap-4">
          <Input
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${selectedToken ? "text-lg" : ""} ${
              error ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />

          {selectedToken && selectedChain && (
            <div className="flex flex-col">
              <span className="text-white truncate text-sm">
                {selectedToken.toUpperCase()}
              </span>
              <span className="text-xs text-white/60 uppercase truncate hidden">
                {selectedChain.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* USD + balance row */}
      <div className="flex items-center justify-between text-xs text-white/40 mt-1">
        <span>
          {usdEquivalent > 0
            ? `≈ $${usdEquivalent.toFixed(2)}`
            : tokenUsdPrice
            ? `1 ${selectedToken?.toUpperCase()} ≈ $${tokenUsdPrice.toFixed(2)}`
            : ""}
        </span>

        {tokenBalance > 0 && (
          <span>
            {formatTokenBalance(tokenBalance)} {selectedToken?.toUpperCase()}{" "}
            available
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-xs mt-1 animate-fadeIn">{error}</p>
      )}
    </div>
  );
}
