"use client";

import { useEffect, useState } from "react";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PairRateDisplayProps {
  fromToken?: string;
  fromChain?: string;
  toToken: string;
  toChain: string;
  amount?: string;
  creatorWallet?: string;
  donorWallet?: string; // creator’s receiving address
  refundAddress?: string; // fan’s refund address
  onContinue?: (shift: any) => void; // callback when shift is successfully created
}

type PairData = {
  min: string;
  max: string;
  rate: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
};

export default function PairRateDisplay({
  fromToken,
  fromChain,
  toToken,
  toChain,
  amount,
  creatorWallet,
  donorWallet,
  refundAddress,
  onContinue,
}: PairRateDisplayProps) {
  const [data, setData] = useState<PairData | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingShift, setCreatingShift] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !fromToken ||
      !fromChain ||
      !toToken ||
      !toChain ||
      !amount ||
      isNaN(Number(amount)) ||
      Number(amount) <= 0
    ) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (
      fromToken.toLowerCase() === toToken.toLowerCase() &&
      fromChain.toLowerCase() === toChain.toLowerCase()
    ) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchRate = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/pair?from=${fromToken}-${fromChain}&to=${toToken}-${toChain}&amount=${amount}`
        );

        const text = await res.text();
        let json: any;
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error("Unexpected response from server");
        }

        if (!res.ok) {
          const msg =
            json?.details?.error?.message ||
            json?.error?.message ||
            json?.error ||
            "Unexpected error";

          if (msg.toLowerCase().includes("below the minimum")) {
            setError(
              msg.replace("Amount is below the minimum of", "Minimum tip is")
            );
          } else if (msg.toLowerCase().includes("above the maximum")) {
            setError(
              msg.replace("Amount is above the maximum of", "Maximum tip is")
            );
          } else if (msg.toLowerCase().includes("cannot shift between")) {
            setError("No conversion needed. Same coin and network selected.");
          } else {
            setError(msg);
          }
          setData(null);
          return;
        }

        setData(json);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, [fromToken, fromChain, toToken, toChain, amount]);

  // --- Shift creation handler ---
  const handleContinue = async () => {
    if (!data || !creatorWallet) {
      setError("Missing required data for creating shift.");
      return;
    }

    setCreatingShift(true);
    setError(null);

    try {
      const res = await fetch("/api/shift/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositCoin: data.depositCoin,
          depositNetwork: data.depositNetwork,
          settleCoin: data.settleCoin,
          settleNetwork: data.settleNetwork,
          creatorWallet,
          donorWallet,
          refundAddress: refundAddress || donorWallet,
          amount,
        }),
      });

      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Shift creation failed");

      console.log("[PAIR UI] Shift created:", json);
      onContinue?.(json); // send shift object (id, address, etc.)
    } catch (err: any) {
      console.error("[PAIR UI] Shift creation error:", err);
      setError(err.message || "Failed to create shift. Please try again.");
    } finally {
      setCreatingShift(false);
    }
  };

  // --- UI states ---
  if (!amount || Number(amount) <= 0) {
    return (
      <div className="bg-zinc-500/10 p-6 rounded-3xl backdrop-blur-3xl text-white/50 shadow-lg text-sm">
        Enter an amount to see the live conversion rate.
      </div>
    );
  }

  if (
    fromToken?.toLowerCase() === toToken.toLowerCase() &&
    fromChain?.toLowerCase() === toChain.toLowerCase()
  ) {
    return (
      <div className="bg-zinc-500/10 p-6 rounded-3xl backdrop-blur-3xl text-white/50 shadow-lg text-sm">
        No conversion required. You’re sending directly in{" "}
        {toToken.toUpperCase()} on {toChain}.
      </div>
    );
  }

  const receiveAmount =
    data && amount ? (Number(amount) * Number(data.rate)).toFixed(3) : null;

  return (
    <div className="bg-zinc-500/10 p-6 rounded-3xl backdrop-blur-3xl text-white shadow-lg">
      <h3 className="font-semibold text-lg text-zinc-100 mb-2">
        Conversion Summary
      </h3>

      {loading && (
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Fetching live rate...
        </div>
      )}

      {error && !loading && (
        <div className="text-red-400 text-sm leading-relaxed">{error}</div>
      )}

      {data && !loading && !error && (
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-primary font-semibold text-base">
              1 {data.depositCoin.toUpperCase()} ≈{" "}
              {Number(data.rate).toFixed(3)} {data.settleCoin.toUpperCase()}
            </p>
            <p className="text-zinc-400 text-xs italic">
              (After network fees and SideShift spread)
            </p>
          </div>

          <div className="bg-zinc-500/10 p-4 rounded-2xl text-sm">
            <p>
              You’re tipping{" "}
              <span className="font-semibold text-white">
                {Number(amount).toFixed(3)} {data.depositCoin.toUpperCase()}
              </span>{" "}
              on {data.depositNetwork}.
            </p>
            <p className="mt-1">
              The creator will receive approximately{" "}
              <span className="font-semibold text-primary">
                {receiveAmount} {data.settleCoin.toUpperCase()}
              </span>{" "}
              on {data.settleNetwork}.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              Min tip: {Number(data.min).toFixed(2)}{" "}
              {data.depositCoin.toUpperCase()}
            </span>
            <span>
              Max tip: {Number(data.max).toFixed(0)}{" "}
              {data.depositCoin.toUpperCase()}
            </span>
          </div>

          <Button
            className="w-full rounded-full mt-2 py-6 text-base font-semibold"
            disabled={creatingShift}
            onClick={handleContinue}
          >
            {creatingShift ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating shift...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
